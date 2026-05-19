<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Interview;
use App\Models\Trainee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Produces the composite multi-metric payload consumed by the Director
 * Dashboard's 70/30 layout. All metrics are resolved in a minimal number
 * of queries to avoid N+1 issues on the summary view.
 */
final class DashboardSummaryController extends Controller
{
    /**
     * GET /api/dashboard/summary
     *
     * Returns:
     *  - pending_applications_count   : int
     *  - scheduled_interviews_count   : int
     *  - applications_this_week_count : int
     *  - active_trainees_count        : int
     *  - avg_completion_rate          : float
     *  - pipeline_items               : array  (recent applications + interview data)
     *  - calendar_events              : array  (upcoming interview schedule feed)
     *  - weekly_growth                : array  (7-day application trend)
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Models\User $director */
        $director    = $request->user();
        $talentGroup = $director->talent_group;

        // ── 1. Scalar metric counters (single aggregation query) ──────────────
        $metrics = Application::query()
            ->when($talentGroup, fn ($q) => $q->where('talent_group', $talentGroup))
            ->selectRaw("
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)             AS pending_count,
                SUM(CASE WHEN status = 'interview_scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
                SUM(CASE WHEN applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS this_week_count
            ")
            ->first();

        // ── 2. Trainee stats ──────────────────────────────────────────────────
        $traineeStats = Trainee::query()
            ->whereHas('user', fn ($q) => $q->when(
                $talentGroup,
                fn ($q2) => $q2->where('talent_group', $talentGroup)
            ))
            ->selectRaw('COUNT(*) AS active_count, AVG(completion_rate) AS avg_rate')
            ->where('current_status', 'active')
            ->first();

        // ── 3. Pipeline items: recent 20 applications with interview data ─────
        $pipelineItems = Application::query()
            ->with(['interview.reviewer:id,name,email'])
            ->when($talentGroup, fn ($q) => $q->where('talent_group', $talentGroup))
            ->whereIn('status', ['pending', 'interview_scheduled'])
            ->orderByDesc('applied_at')
            ->limit(20)
            ->get()
            ->map(fn (Application $app): array => [
                'id'           => $app->id,
                'personal_info'=> $app->personal_info,
                'talent_group' => $app->talent_group,
                'status'       => $app->status,
                'applied_at'   => $app->applied_at?->toISOString(),
                'interview'    => $app->interview ? [
                    'id'           => $app->interview->id,
                    'scheduled_at' => $app->interview->scheduled_at?->toISOString(),
                    'venue'        => $app->interview->venue,
                    'outcome'      => $app->interview->outcome,
                    'reviewer'     => $app->interview->reviewer
                        ? ['id' => $app->interview->reviewer->id, 'name' => $app->interview->reviewer->name]
                        : null,
                ] : null,
            ]);

        // ── 4. Calendar feed: upcoming interviews (next 30 days) ─────────────
        $calendarEvents = Interview::query()
            ->with(['application:id,applicant_name,talent_group'])
            ->whereHas('application', fn ($q) => $q->when(
                $talentGroup,
                fn ($q2) => $q2->where('talent_group', $talentGroup)
            ))
            ->where('scheduled_at', '>=', Carbon::now())
            ->where('scheduled_at', '<=', Carbon::now()->addDays(30))
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (Interview $iv): array => [
                'id'             => $iv->id,
                'application_id' => $iv->application_id,
                'applicant_name' => $iv->application?->applicant_name,
                'talent_group'   => $iv->application?->talent_group,
                'scheduled_at'   => $iv->scheduled_at?->toISOString(),
                'venue'          => $iv->venue,
                'outcome'        => $iv->outcome,
            ]);

        // ── 5. Weekly growth trend (last 7 days, grouped by date) ────────────
        $weeklyGrowth = Application::query()
            ->when($talentGroup, fn ($q) => $q->where('talent_group', $talentGroup))
            ->where('applied_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->selectRaw("DATE(applied_at) AS date, COUNT(*) AS count")
            ->groupByRaw('DATE(applied_at)')
            ->orderByRaw('DATE(applied_at)')
            ->get()
            ->map(fn ($row): array => [
                'date'  => $row->date,
                'count' => (int) $row->count,
            ]);
        return response()->json([
            'data' => [
                'pending_applications_count'   => (int) ($metrics->pending_count   ?? 0),
                'scheduled_interviews_count'   => (int) ($metrics->scheduled_count ?? 0),
                'applications_this_week_count' => (int) ($metrics->this_week_count ?? 0),
                'active_trainees_count'        => (int) ($traineeStats->active_count ?? 0),
                'avg_completion_rate'          => round((float) ($traineeStats->avg_rate ?? 0), 1),
                'pipeline_items'               => $pipelineItems,
                'calendar_events'              => $calendarEvents,
                'weekly_growth'                => $weeklyGrowth,
            ],
        ], Response::HTTP_OK);
    }
}

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
use Symfony\Component\HttpFoundation\Response;
 
final class DashboardSummaryController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user        = $request->user();
        $talentGroup = $user->talent_group;
 
        $metrics = Application::query()
            ->when($talentGroup, fn($q) => $q->where('talent_group', $talentGroup))
            ->selectRaw("
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN status = 'interview_scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
                SUM(CASE WHEN applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS this_week_count
            ")->first();
 
        $traineeStats = Trainee::query()
            ->where('current_status', 'active')
            ->when($talentGroup, fn($q) => $q->whereHas('user', fn($q2) => $q2->where('talent_group', $talentGroup)))
            ->selectRaw('COUNT(*) AS active_count, AVG(completion_rate) AS avg_rate')
            ->first();
 
        $pipelineItems = Application::with('interview')
            ->when($talentGroup, fn($q) => $q->where('talent_group', $talentGroup))
            ->whereIn('status', ['pending', 'interview_scheduled'])
            ->orderByDesc('applied_at')
            ->limit(20)
            ->get();
 
        $calendarEvents = Interview::with('application')
            ->where('scheduled_at', '>=', Carbon::now())
            ->where('scheduled_at', '<=', Carbon::now()->addDays(30))
            ->when($talentGroup, fn($q) => $q->whereHas('application', fn($q2) => $q2->where('talent_group', $talentGroup)))
            ->orderBy('scheduled_at')
            ->get();
 
        $weeklyGrowth = Application::query()
            ->when($talentGroup, fn($q) => $q->where('talent_group', $talentGroup))
            ->where('applied_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(applied_at) AS date, COUNT(*) AS count')
            ->groupByRaw('DATE(applied_at)')
            ->orderByRaw('DATE(applied_at)')
            ->get();
 
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

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Engagement;
use App\Models\Evaluation;
use App\Models\Scholarship;
use App\Models\Trainee;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

final class AuthController extends Controller
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'role'  => ['nullable', 'in:admin,director,scholar,student,trainee'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        // Always return a generic success response to avoid account enumeration.
        if (! $user || ! $this->roleMatchesRecoverySelection($user->role, $data['role'] ?? null)) {
            return response()->json([
                'message' => 'If an account exists for that email, a password reset link has been sent.',
            ], Response::HTTP_OK);
        }

        $token = Password::broker()->createToken($user);
        $frontendUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
        $email = urlencode($user->email);
        $link = "{$frontendUrl}/?page=reset-password&token={$token}&email={$email}";

        $body = implode(PHP_EOL, [
            'Dear ' . $user->name . ',',
            '',
            'We received a request to reset your TalentTrackUNC password.',
            'Open this link to set a new password:',
            $link,
            '',
            'This reset link will expire in 60 minutes.',
            'If you did not request this, you can ignore this email.',
            '',
            'Regards,',
            config('app.name', 'TalentTrackUNC'),
        ]);

        Mail::raw($body, function ($message) use ($user): void {
            $message->to($user->email)->subject('Password Reset - ' . config('app.name', 'TalentTrackUNC'));
        });

        return response()->json([
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ], Response::HTTP_OK);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::broker()->reset(
            [
                'email' => $data['email'],
                'token' => $data['token'],
                'password' => $data['password'],
                'password_confirmation' => $request->input('password_confirmation'),
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke active sessions/tokens so login requires the new password.
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'message' => 'Password has been reset successfully. You can now log in.',
        ], Response::HTTP_OK);
    }

    private function roleMatchesRecoverySelection(string $actualRole, ?string $selectedRole): bool
    {
        if (! $selectedRole) {
            return true;
        }

        // Frontend labels "trainee" while this codebase may still persist role as "student".
        if ($selectedRole === 'trainee') {
            return in_array($actualRole, ['trainee', 'student'], true);
        }

        return $actualRole === $selectedRole;
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
            'role'     => ['nullable', 'in:admin,director,scholar,student,trainee'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], Response::HTTP_UNAUTHORIZED);
        }

        if (! $this->roleMatchesRecoverySelection($user->role, $request->input('role'))) {
            return response()->json([
                'message' => 'The selected Login As role does not match this account.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->tokens()->delete();

        $token = $user->createToken("api-token-{$user->id}")->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'role'            => $user->role,
                'talent_group'    => $user->talent_group,
                'student_id'      => $user->student_id,
                'phone'      => $user->phone,
                'year_level' => $user->year_level,
                'course'     => $user->course,
                'department' => $user->department,
                'address'    => $user->address,
                'application_status' => $user->application_status,
                'training_status' => $user->training_status,
                'is_active'  => true,
                'created_at' => $user->created_at,
            ],
        ], Response::HTTP_OK);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.'], Response::HTTP_OK);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'role'            => $user->role,
            'talent_group'    => $user->talent_group,
            'student_id'      => $user->student_id,
            'phone'      => $user->phone,
            'year_level' => $user->year_level,
            'course'     => $user->course,
            'department' => $user->department,
            'address'    => $user->address,
            'application_status' => $user->application_status,
            'training_status' => $user->training_status,
            'is_active'  => true,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * PATCH /api/v1/me
     * Allows authenticated users to update their own editable profile fields.
     */
    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'       => ['sometimes', 'string', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:50'],
            'year_level' => ['nullable', 'string', 'max:50'],
            'course'     => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'address'    => ['nullable', 'string'],
        ]);

        $user->update($data);

        return response()->json([
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'role'            => $user->role,
            'talent_group'    => $user->talent_group,
            'student_id'      => $user->student_id,
            'phone'           => $user->phone,
            'year_level'      => $user->year_level,
            'course'          => $user->course,
            'department'      => $user->department,
            'address'         => $user->address,
            'application_status' => $user->application_status,
            'training_status' => $user->training_status,
            'is_active'       => true,
            'created_at'      => $user->created_at,
        ], Response::HTTP_OK);
    }

    /**
     * Refresh the authentication token.
     * Issues a new token with the same abilities as the current token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $user->currentAccessToken();

        if (!$currentToken) {
            return response()->json([
                'message' => 'No active token found.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Create new token with same abilities as current token
        $abilities = $currentToken->abilities;

        // Revoke old token
        $currentToken->delete();

        // Issue new token
        $newToken = $user->createToken(
            name: "api-token-{$user->id}-refreshed",
            abilities: $abilities,
        )->plainTextToken;

        return response()->json([
            'token' => $newToken,
            'user'  => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'talent_group' => $user->talent_group,
                'student_id'   => $user->student_id,
                'phone'        => $user->phone,
                'year_level'   => $user->year_level,
                'course'       => $user->course,
                'department'   => $user->department,
                'address'      => $user->address,
                'application_status' => $user->application_status,
                'training_status' => $user->training_status,
                'is_active'    => true,
                'created_at'   => $user->created_at,
            ],
        ], Response::HTTP_OK);
    }

    public function index(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        $query = User::with(['trainee:id,user_id,instrument,voice'])->select([
            'id', 'name', 'email', 'role', 'talent_group',
            'student_id', 'phone', 'year_level', 'course', 'department', 'address', 'created_at',
        ]);

        if ($currentUser->role === 'director') {
            // Directors only see scholars in their group; trainees are managed via the training endpoint
            $query->where('talent_group', $currentUser->talent_group)
                  ->where('role', 'scholar');
        }

        $users = $query->get()->map(fn ($u) => array_merge($u->toArray(), ['is_active' => true]));

        return response()->json($users, Response::HTTP_OK);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->role === 'director' && $user->talent_group !== $currentUser->talent_group) {
            throw new AuthorizationException('You are not authorized to view this user.');
        }

        $trainee = Trainee::query()
            ->where('user_id', $user->id)
            ->select([
                'id',
                'user_id',
                'current_status',
                'chapter',
                'completion_rate',
                'instrument',
                'voice',
                'date_joined',
            ])
            ->first();

        $evaluations = Evaluation::query()
            ->whereHas('trainee', fn ($q) => $q->where('user_id', $user->id))
            ->with(['evaluator:id,name'])
            ->orderByDesc('evaluation_date')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get([
                'id',
                'trainee_id',
                'rating',
                'adjectival_rating',
                'recommend_for_renewal',
                'scholarship_percentage',
                'evaluation_date',
                'status',
                'evaluator_id',
                'created_at',
            ]);

        $renewals = Scholarship::query()
            ->where('user_id', $user->id)
            ->with([
                'evaluation:id,rating,adjectival_rating,recommend_for_renewal,scholarship_percentage,evaluation_date,evaluator_id',
                'evaluation.evaluator:id,name',
            ])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get([
                'id',
                'user_id',
                'semester',
                'year',
                'gpa',
                'status',
                'reviewed_at',
                'review_notes',
                'created_at',
            ]);

        $documents = Document::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get([
                'id',
                'title',
                'file_name',
                'file_type',
                'category',
                'status',
                'created_at',
            ]);

        $engagementQuery = Engagement::query()
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->limit(10)
            ->select([
                'id',
                'event_name',
                'date',
                'time',
                'venue',
                'status',
                'talent_groups',
                'created_by',
            ]);

        $engagementQuery->where(function ($q) use ($user): void {
            $q->where('created_by', $user->id);
            if (! empty($user->talent_group)) {
                $q->orWhereJsonContains('talent_groups', $user->talent_group);
            }
        });

        $engagements = $engagementQuery->get();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'talent_group' => $user->talent_group,
                'student_id' => $user->student_id,
                'phone' => $user->phone,
                'year_level' => $user->year_level,
                'course' => $user->course,
                'department' => $user->department,
                'address' => $user->address,
                'created_at' => $user->created_at,
                'is_active' => true,
                'connections' => [
                    'trainee_profile' => $trainee,
                    'evaluations' => $evaluations,
                    'scholarship_renewals' => $renewals,
                    'documents' => $documents,
                    'engagements' => $engagements,
                ],
            ],
        ], Response::HTTP_OK);
    }

    /**
     * Maps roles to Sanctum token abilities.
     *
     * @return string[]
     */
    private function abilitiesForRole(string $role): array
    {
        return match ($role) {
            'admin'    => ['*'],
            'director' => [
                'dashboard:read',
                'applications:read',
                'applications:write',
                'interviews:read',
                'interviews:write',
                'trainees:read',
                'trainees:write',
                'attendance:read',
                'attendance:write',
                'evaluations:read',
                'evaluations:write',
            ],
            'trainee', 'student' => [
                'dashboard:read',
                'attendance:read',
                'evaluations:read',
            ],
            'scholar' => [
                'dashboard:read',
                'evaluations:read',
            ],
            default => ['dashboard:read'],
        };
    }

    /**
     * PATCH /api/v1/users/{user}  (admin only)
     * Allows admin to update a user's profile fields.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'name'         => ['sometimes', 'string', 'max:255'],
            'email'        => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone'        => ['nullable', 'string', 'max:50'],
            'year_level'   => ['nullable', 'string', 'max:50'],
            'course'       => ['nullable', 'string', 'max:255'],
            'department'   => ['nullable', 'string', 'max:255'],
            'address'      => ['nullable', 'string'],
            'talent_group' => ['nullable', 'string', 'max:100'],
        ]);

        $user->update($data);

        return response()->json([
            'data' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'talent_group' => $user->talent_group,
                'student_id'   => $user->student_id,
                'phone'        => $user->phone,
                'year_level'   => $user->year_level,
                'course'       => $user->course,
                'department'   => $user->department,
                'address'      => $user->address,
                'created_at'   => $user->created_at,
            ],
        ]);
    }
}

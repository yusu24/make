<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function publicIndex()
    {
        $testimonials = Testimonial::where('active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function index()
    {
        $testimonials = Testimonial::orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'role' => 'required|string|max:150',
            'text' => 'required|string',
            'stars'=> 'nullable|integer|min:1|max:5',
        ]);

        $initials = collect(explode(' ', $request->name))
            ->map(fn($n) => mb_substr($n, 0, 1))
            ->take(2)
            ->join('');
        $initials = strtoupper($initials);

        // Curated harmonic pastel colors
        $colors = [
            ['bg' => '#E1F5EE', 'fg' => '#0F6E56'],
            ['bg' => '#E6F1FB', 'fg' => '#185FA5'],
            ['bg' => '#FAEEDA', 'fg' => '#BA7517'],
            ['bg' => '#F4E8F8', 'fg' => '#9333ea'],
            ['bg' => '#FFE4E6', 'fg' => '#e11d48']
        ];
        $picked = $colors[array_rand($colors)];

        $testimonial = Testimonial::create([
            'name'          => $request->name,
            'role'          => $request->role,
            'avatar_text'   => $request->avatar_text ?: $initials,
            'avatar_bg'     => $request->avatar_bg ?: $picked['bg'],
            'avatar_color'  => $request->avatar_color ?: $picked['fg'],
            'stars'         => $request->stars ?? 5,
            'text'          => $request->text,
            'active'        => filter_var($request->active ?? true, FILTER_VALIDATE_BOOLEAN),
            'sort_order'    => $request->sort_order ?? 0,
        ]);

        ActivityLog::record('create_testimonial', 'Testimoni: ' . $testimonial->name, 'success');

        return response()->json(['success' => true, 'message' => 'Testimoni berhasil dibuat', 'data' => $testimonial], 201);
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $testimonial->update([
            'name'          => $request->name ?? $testimonial->name,
            'role'          => $request->role ?? $testimonial->role,
            'avatar_text'   => $request->avatar_text ?? $testimonial->avatar_text,
            'avatar_bg'     => $request->avatar_bg ?? $testimonial->avatar_bg,
            'avatar_color'  => $request->avatar_color ?? $testimonial->avatar_color,
            'stars'         => $request->has('stars') ? $request->stars : $testimonial->stars,
            'text'          => $request->text ?? $testimonial->text,
            'active'        => $request->has('active') ? filter_var($request->active, FILTER_VALIDATE_BOOLEAN) : $testimonial->active,
            'sort_order'    => $request->has('sort_order') ? $request->sort_order : $testimonial->sort_order,
        ]);

        ActivityLog::record('edit_testimonial', 'Testimoni: ' . $testimonial->name, 'info');

        return response()->json(['success' => true, 'message' => 'Testimoni diperbarui', 'data' => $testimonial]);
    }

    public function destroy(Testimonial $testimonial)
    {
        ActivityLog::record('delete_testimonial', 'Testimoni: ' . $testimonial->name, 'danger');
        $testimonial->delete();
        return response()->json(['success' => true, 'message' => 'Testimoni dihapus']);
    }

    public function toggle(Testimonial $testimonial)
    {
        $testimonial->update(['active' => !$testimonial->active]);
        ActivityLog::record('toggle_testimonial', 'Testimoni: ' . $testimonial->name, 'warning');
        return response()->json(['success' => true, 'message' => 'Status testimoni diperbarui', 'data' => $testimonial]);
    }

    public function publicSubmit(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:100',
            'role'  => 'required|string|max:150',
            'text'  => 'required|string',
            'stars' => 'required|integer|min:1|max:5',
        ]);

        $initials = collect(explode(' ', $request->name))
            ->map(fn($n) => mb_substr($n, 0, 1))
            ->take(2)
            ->join('');
        $initials = strtoupper($initials);

        // Curated harmonic pastel colors
        $colors = [
            ['bg' => '#E1F5EE', 'fg' => '#0F6E56'],
            ['bg' => '#E6F1FB', 'fg' => '#185FA5'],
            ['bg' => '#FAEEDA', 'fg' => '#BA7517'],
            ['bg' => '#F4E8F8', 'fg' => '#9333ea'],
            ['bg' => '#FFE4E6', 'fg' => '#e11d48']
        ];
        $picked = $colors[array_rand($colors)];

        $testimonial = Testimonial::create([
            'name'          => $request->name,
            'role'          => $request->role,
            'avatar_text'   => $initials,
            'avatar_bg'     => $picked['bg'],
            'avatar_color'  => $picked['fg'],
            'stars'         => $request->stars,
            'text'          => $request->text,
            'active'        => false, // Default is pending approval!
            'sort_order'    => 99, // Place at the end
        ]);

        ActivityLog::record('submit_testimonial_pending', 'Testimoni Baru (Pending) dari: ' . $testimonial->name, 'warning');

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil dikirim untuk ditinjau oleh Admin',
            'data'    => $testimonial
        ]);
    }
}

export default function TestPage() {
  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-bold text-ink mb-4 font-display">
          CSS Test Page
        </h1>
        <p className="text-lg text-muted mb-8">
          If you see text with a cream background, custom colors, and this font styling, then Tailwind CSS and custom colors are working.
        </p>
        
        <div className="bg-white border-2 border-sand rounded-lg p-6 mb-6">
          <p className="text-ink font-semibold mb-2">Color Test:</p>
          <div className="flex gap-2 flex-wrap">
            <div className="bg-cream text-ink px-3 py-1 rounded border border-sand">cream</div>
            <div className="bg-ink text-cream px-3 py-1 rounded">ink</div>
            <div className="bg-rose text-white px-3 py-1 rounded">rose</div>
            <div className="bg-sage text-white px-3 py-1 rounded">sage</div>
            <div className="bg-sand text-ink px-3 py-1 rounded">sand</div>
            <div className="bg-muted text-white px-3 py-1 rounded">muted</div>
          </div>
        </div>

        <div className="bg-white border-2 border-sand rounded-lg p-6">
          <p className="text-ink font-semibold mb-2">Font Test:</p>
          <p className="font-display text-2xl font-black mb-2">Font Display (Playfair)</p>
          <p className="font-body text-base mb-2">Font Body (DM Sans)</p>
          <p className="font-mono text-sm">Font Mono (DM Mono)</p>
        </div>
      </div>
    </div>
  );
}

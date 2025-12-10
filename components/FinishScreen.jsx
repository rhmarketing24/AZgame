export default function FinishScreen({time, onSubmit, onRetry, onBack, submitted}) {
  return (
    <div className="center" style={{marginTop:8}}>
      <h2>Completed in {time?.toFixed(3)}s</h2>
      <div style={{margin:12}}>
        <button className="btn" onClick={onSubmit} disabled={submitted}>{submitted ? 'Submitted ✓' : 'Submit Score'}</button>
      </div>
      <div style={{display:'flex',gap:12}}>
        <button className="small-btn" onClick={onBack}>Back</button>
        <button className="small-btn" onClick={onRetry}>Play again</button>
      </div>
    </div>
  );
}

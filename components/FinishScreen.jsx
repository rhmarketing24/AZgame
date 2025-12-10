export default function FinishScreen({time, onSubmit, onBack, onPlayAgain}) {
  return (
    <div>
      <h2 style={{fontSize:28}}>Completed in {time.toFixed(3)}s</h2>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={onSubmit}>Submit Score</button>
      </div>
      <div className="footer-buttons">
        <button className="btn btn-outline" onClick={onBack}>Back</button>
        <button className="btn btn-outline" onClick={onPlayAgain}>Play again</button>
      </div>
    </div>
  );
}

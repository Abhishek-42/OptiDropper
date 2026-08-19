interface ResultDisplayProps {
  result: string | null;
}

/**
 * Shows the decoded text payload once all frames are assembled.
 */
export function ResultDisplay({ result }: ResultDisplayProps) {
  if (result === null) {
    return (
      <div className="result result--empty">
        Decoded text will appear here once scanning is complete.
      </div>
    );
  }

  return (
    <div className="result" id="decoded-result">
      {result}
    </div>
  );
}

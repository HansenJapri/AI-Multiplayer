import type { RunCheckpoint } from "@/lib/runs/runs";

// Each ready checkpoint gets the one command a teammate runs in a clean clone of the project to
// continue from that step on their own machine, as a fork that never changes this run.
export function HandoverPanel({
  runId,
  checkpoints,
  cliPackageUrl,
}: {
  runId: string;
  checkpoints: RunCheckpoint[];
  cliPackageUrl: string;
}) {
  return (
    <section aria-label="Hand over" className="card handover">
      <h2>Hand over</h2>
      {checkpoints.length === 0 ? (
        <p className="muted">
          A checkpoint is saved at the end of each agent turn in a git project. None yet.
        </p>
      ) : (
        <>
          <p className="muted">
            Run a command in a clean clone of the project to continue from that step on your own
            machine. You get a new branch and a forked Claude Code session.
          </p>
          <ol className="list">
            {checkpoints.map((checkpoint) => (
              <li key={checkpoint.step} className="checkpoint">
                <span>Step {checkpoint.step}</span>
                {checkpoint.ready ? (
                  <code className="code">
                    npx --yes {cliPackageUrl} resume {runId} --step {checkpoint.step}
                  </code>
                ) : (
                  <span className="badge">uploading</span>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

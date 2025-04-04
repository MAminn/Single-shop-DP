import { usePageContext } from "vike-react/usePageContext";

interface RouteDebuggerProps {
  showRouteParams?: boolean;
  showUrlInfo?: boolean;
  showInProduction?: boolean;
}

export function RouteDebugger({
  showRouteParams = true,
  showUrlInfo = true,
  showInProduction = false,
}: RouteDebuggerProps) {
  const ctx = usePageContext();

  // Don't show in production unless explicitly enabled
  if (import.meta.env.PROD && !showInProduction) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-4 rounded-tl-lg text-xs font-mono z-50 max-w-[500px] overflow-auto max-h-[300px]">
      <h3 className="font-bold mb-2 text-yellow-400">Route Debugger</h3>

      {showUrlInfo && (
        <>
          <div>
            <span className="text-blue-400">URL Path:</span> {ctx.urlPathname}
          </div>
          <div>
            <span className="text-blue-400">URL Origin:</span>{" "}
            {ctx.urlParsed.origin}
          </div>
          <div>
            <span className="text-blue-400">URL Pathname:</span>{" "}
            {ctx.urlParsed.pathname}
          </div>
        </>
      )}

      {showRouteParams && (
        <div className="mt-2">
          <span className="text-green-400">Route Params:</span>{" "}
          {Object.keys(ctx.routeParams || {}).length > 0 ? (
            <pre>{JSON.stringify(ctx.routeParams, null, 2)}</pre>
          ) : (
            "<none>"
          )}
        </div>
      )}

      <button
        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
        onClick={() => {
          console.log("Page Context:", ctx);
        }}
        type="button"
      >
        Log Context to Console
      </button>
    </div>
  );
}

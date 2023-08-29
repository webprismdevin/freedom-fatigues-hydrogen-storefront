export default function RedoCheckbox({redo}: {redo: boolean}) {
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      ref={redoBox}
      onChange={(e) => setRedo(e.target.checked)}
      checked={redo}
    />
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[11px]">
        Get free returns for store credit, or exchange, for $1.98 via re:do
      </span>
    </div>
  </div>;
}

// todo - move redo functionality into it's own component 
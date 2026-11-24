import Dialog from '../../ui/Dialog'

const GROUPS = [
  {
    title: 'General',
    items: [
      [['N'], 'New task'],
      [['/'], 'Search'],
      [['['], 'Show or hide sidebar'],
      [['?'], 'Show shortcuts'],
      [['Esc'], 'Close panel / clear filters'],
    ],
  },
  {
    title: 'Views',
    items: [
      [['1'], 'Board'],
      [['2'], 'List'],
      [['3'], 'Insights'],
    ],
  },
  {
    title: 'Cards',
    items: [
      [['Enter'], 'Open task'],
      [['Alt', '←'], 'Move to previous column'],
      [['Alt', '→'], 'Move to next column'],
    ],
  },
]

export default function ShortcutsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts" size="sm">
      <div className="shortcuts">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3 className="side-title">{g.title}</h3>
            <dl>
              {g.items.map(([keys, label]) => (
                <div key={label} className="shortcut">
                  <dt>{label}</dt>
                  <dd>
                    {keys.map((k) => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  )
}

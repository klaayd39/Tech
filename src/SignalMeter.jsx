export default function SignalMeter({ status }) {
  const levels = {
    operational: { bars: 4, color: '#4CAF50', label: 'Operational' },
    maintenance: { bars: 2, color: '#FFC107', label: 'Maintenance' },
    faulty: { bars: 1, color: '#E53935', label: 'Faulty' },
    decommissioned: { bars: 0, color: '#555', label: 'Decommissioned' },
  }
  const config = levels[status] || levels.operational
  const totalBars = 4

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
        {Array.from({ length: totalBars }).map((_, i) => {
          const active = i < config.bars
          const height = 6 + i * 3
          return (
            <div
              key={i}
              style={{
                width: 4,
                height,
                borderRadius: 1,
                background: active ? config.color : '#2A2A2A',
                transition: 'background 0.3s',
              }}
            />
          )
        })}
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: config.color, letterSpacing: 0.5 }}>
        {config.label}
      </span>
    </div>
  )
}

import { getStatusTabKey } from '../../utils/lelang.js'

const tabs = [
  { id: 'DRAFT', label: 'DRAFT' },
  { id: 'ACTIVE', label: 'ACTIVE' },
  { id: 'EXTENDED', label: 'EXTENDED' },
  { id: 'CLOSED', label: 'CLOSED' },
]

const AuctionStatusTabs = ({ status }) => {
  const activeTab = getStatusTabKey(status)

  return (
    <section className="panel lelang-tabs-panel" aria-label="Status lelang">
      <div className="lelang-tabs">
        {tabs.map((tab) => (
          <span
            className={`lelang-tab${activeTab === tab.id ? ' active' : ''}`}
            key={tab.id}
          >
            {tab.label}
          </span>
        ))}
      </div>
    </section>
  )
}

export default AuctionStatusTabs

import './ticket-count-satutus.css'

type TicketStatusCountProps = {
    color: string
    name: string
    count: number
  }
  
  function TicketStatusCount({ color, name, count }: TicketStatusCountProps) {
    return (
      <div className="status">
        <span className="statusColor" style={{ background: color }}></span>
        <span className="statusText">{name}</span>
        <span className="statusCount">{count}</span>
      </div>
    )
  }
  
  export default TicketStatusCount
  
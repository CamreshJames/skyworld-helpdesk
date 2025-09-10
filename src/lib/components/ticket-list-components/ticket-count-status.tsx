import './ticket-count-satutus.css';

type TicketStatusCountProps = {
  color: string;
  name: string;
  count: number;
  onClick: () => void;
  selected: boolean;
};

function TicketStatusCount({ color, name, count, onClick, selected }: TicketStatusCountProps) {
  return (
    <div className={`status ${selected ? 'selected' : ''}`} onClick={onClick}>
      <span className="statusColor" style={{ background: color }}></span>
      <span className="statusText">{name}</span>
      <span className="statusCount">{count}</span>
    </div>
  );
}

export default TicketStatusCount;
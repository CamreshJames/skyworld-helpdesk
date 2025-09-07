import './form.css';

function TicketForm() {
  return (
    <>
      <div className="form">
        <label htmlFor="username">Username</label>
        <input type="text" name="username" placeholder="username..." />
      </div>
    </>
  );
}

export default TicketForm;

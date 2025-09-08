import './form.css';

function TicketForm() {
  return (
    <div className="ticket-form-container">
      <h2>Create a New Ticket</h2>
      <form className="ticket-form">
        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <input type="text" id="summary" name="summary" placeholder="Enter a brief summary..." />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" placeholder="Provide a detailed description..."></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="attachment">Attachment</label>
          <input type="file" id="attachment" name="attachment" />
        </div>
        <button type="submit" className="submit-btn">Submit Ticket</button>
      </form>
    </div>
  );
}

export default TicketForm;

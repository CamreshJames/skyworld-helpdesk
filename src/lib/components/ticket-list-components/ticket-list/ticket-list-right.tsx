import React from 'react';
import Table from '../../../utils/table/Table.tsx';
import type { ColumnProps } from '../../../utils/table/Table.tsx';
import type { Ticket, Attachment } from '../../../pages/ticket-form/form.tsx';

// Columns configuration for ticket table
const ticketColumnsMap: Record<string, Partial<ColumnProps<Ticket>>> = {
  id: { hide: true },
  mainCategory: { caption: 'Main Category', size: 200 },
  subCategory: { caption: 'Sub Category', size: 200 },
  problemIssue: { caption: 'Problem/Issue', size: 250 },
  description: {
    size: 300,
    render: (data: Ticket) => (
      <div
        dangerouslySetInnerHTML={{ __html: data.description }}
        style={{ maxHeight: '100px', overflowY: 'auto' }}
      />
    )
  },
  attachments: {
    caption: 'Attachments',
    size: 200,
    render: (data: Ticket) =>
      data.attachments.map((att: Attachment) => att.name).join(', ') || 'None'
  },
  createdAt: { caption: 'Created At', size: 200, data_type: 'date' }
};

// Props type
interface TicketTableListProps {
  tickets: Ticket[];
}
function TicketTableList({ tickets }: TicketTableListProps) {
  return <Table data={tickets} columnsMap={ticketColumnsMap} />;
}
export default TicketTableList

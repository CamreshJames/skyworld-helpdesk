import React, { useState, useEffect } from 'react';
import TiptapEditor from './editor/tiptap-editor';
import './form.css';
import { AttachmentPinIcon } from '../../utils/icons';

// Types
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface TicketFormData {
  mainCategory: string;
  subCategory: string;
  projectPhase: string;
  description: string;
  attachments: Attachment[];
}

interface Ticket extends TicketFormData {
  id: string;
  createdAt: string;
}

function TicketForm() {
  const [formData, setFormData] = useState<TicketFormData>({
    mainCategory: '',
    subCategory: '',
    projectPhase: '',
    description: 'Description',
    attachments: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TicketFormData, string>>>({});
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    // Initialize from localStorage if available
    const savedTickets = localStorage.getItem('tickets');
    return savedTickets ? JSON.parse(savedTickets) : [];
  });
  const [, setSelectedFiles] = useState<FileList | null>(null);

  // Save to localStorage and sessionStorage whenever tickets change
  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
    sessionStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TicketFormData, string>> = {};

    if (!formData.mainCategory.trim()) {
      newErrors.mainCategory = 'Main Category is required';
    }

    if (!formData.subCategory.trim()) {
      newErrors.subCategory = 'Sub Category is required';
    }

    if (!formData.projectPhase.trim()) {
      newErrors.projectPhase = 'Project Phase is required';
    }

    if (formData.description.trim() === 'Description' || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    // Validate attachments
    if (formData.attachments.length > 5) {
      newErrors.attachments = 'Maximum 5 files allowed';
    }

    formData.attachments.forEach((attachment) => {
      const validExtensions = ['jpg', 'jpeg', 'pdf', 'png'];
      const extension = attachment.name.split('.').pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        newErrors.attachments = 'Only .jpg, .jpeg, .pdf, .png files are allowed';
      }
      if (attachment.size > 2 * 1024 * 1024) { // 2MB in bytes
        newErrors.attachments = 'File size must not exceed 2MB';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'mainCategory' && { subCategory: '' })
    }));
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);

      const newAttachments: Attachment[] = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type
      }));

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
      // Validate attachments immediately
      validateForm();
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
    // Re-validate after removing attachment
    validateForm();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (event: React.FormEvent, addAnother: boolean = false) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newTicket: Ticket = {
      ...formData,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setTickets(prev => [...prev, newTicket]);

    if (!addAnother) {
      alert('Ticket created successfully!');
      handleCancel();
    } else {
      alert('Ticket created successfully! Ready to add another.');
      setFormData({
        mainCategory: '',
        subCategory: '',
        projectPhase: '',
        description: 'Description',
        attachments: []
      });
      setSelectedFiles(null);
    }
  };

  const handleCancel = () => {
    setFormData({
      mainCategory: '',
      subCategory: '',
      projectPhase: '',
      description: 'Description',
      attachments: []
    });
    setSelectedFiles(null);
    setErrors({});
  };

  const ErrorIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '4px', verticalAlign: 'middle' }}
    >
      <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
      <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="12" r="1" fill="red" />
    </svg>
  );

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <h2>Create Ticket</h2>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="ticket-form">
        <div className="form-group">
          <label htmlFor="mainCategory">Main Category *</label>
          <input
            id="mainCategory"
            value={formData.mainCategory}
            onChange={(e) => handleInputChange('mainCategory', e.target.value)}
            placeholder="Enter Main Category"
            required
          />
          {errors.mainCategory && (
            <div style={{ color: 'red', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <ErrorIcon />
              {errors.mainCategory}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="subCategory">Sub Category *</label>
          <input
            id="subCategory"
            value={formData.subCategory}
            onChange={(e) => handleInputChange('subCategory', e.target.value)}
            placeholder="Enter Sub Category"
            disabled={!formData.mainCategory}
            required
          />
          {errors.subCategory && (
            <div style={{ color: 'red', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <ErrorIcon />
              {errors.subCategory}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="projectPhase">Project Phase *</label>
          <input
            id="projectPhase"
            value={formData.projectPhase}
            onChange={(e) => handleInputChange('projectPhase', e.target.value)}
            placeholder="Enter Project Phase"
            required
          />
          {errors.projectPhase && (
            <div style={{ color: 'red', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <ErrorIcon />
              {errors.projectPhase}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Description *</label>
          <TiptapEditor
            content={formData.description}
            onChange={(content) => handleInputChange('description', content)}
          />
          {errors.description && (
            <div style={{ color: 'red', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <ErrorIcon />
              {errors.description}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Attachments</label>
          <div className="attachment-section">
            <input
              type="file"
              id="fileInput"
              multiple
              accept=".jpg,.jpeg,.pdf,.png"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('fileInput')?.click()}
              className="attach-button"
            >
              Select Files
            </button>
            <div className="attachment-instruction">
              <div>
                Allowed file extensions: <span className="bold-text">.jpg, .jpeg, .pdf, .png</span>
              </div>
              <div>
                Maximum File Size: <span className="bold-text">2MB</span>
              </div>
              <div>
                Maximum No. of File: <span className="bold-text">5</span>
              </div>
            </div>

            {formData.attachments.length > 0 && (
              <div className="attachments-list">
                {formData.attachments.map(attachment => (
                  <div key={attachment.id} className="attachment-item">
                    <AttachmentPinIcon />
                    <span className="attachment-name">{attachment.name}</span>
                    <span className="attachment-size">({formatFileSize(attachment.size)})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="remove-attachment"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.attachments && (
              <div style={{ color: 'red', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                <ErrorIcon />
                {errors.attachments}
              </div>
            )}
          </div>
        </div>
      </form>
      <div className="form-actions">
        <button type="submit" onClick={(e) => handleSubmit(e)} className="create-button">
          Create
        </button>
        <button type="button" onClick={(e) => handleSubmit(e, true)} className="create-assign-button">
          Create and add another
        </button>
        <button type="button" onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TicketForm;
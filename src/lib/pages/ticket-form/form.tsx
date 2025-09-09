import React, { useState, useEffect } from 'react';
import TiptapEditor from './editor/tiptap-editor';
import './form.css';
import { AttachmentPinIcon } from '../../utils/icons';
import { encryptData, decryptData } from '../../utils/cryptoUtils';

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
  problemIssue: string;
  description: string;
  attachments: Attachment[];
}

interface Ticket extends TicketFormData {
  id: string;
  createdAt: string;
}

function TicketForm() {
  // Initial form state with empty description
  const [formData, setFormData] = useState<TicketFormData>({
    mainCategory: '',
    subCategory: '',
    problemIssue: '',
    description: '<p></p>',
    attachments: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TicketFormData, string>>>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [, setSelectedFiles] = useState<FileList | null>(null);

  // Check for encryption key on mount
  const aesKey = import.meta.env.VITE_AES_KEY;
  useEffect(() => {
    if (!aesKey) {
      console.error('VITE_AES_KEY is not defined in the .env file');
      setStorageError('Encryption key is missing. Please contact support.');
    }
  }, []); // Empty dependency array to run once on mount

  // Load and decrypt tickets from localStorage on mount
  useEffect(() => {
    if (!aesKey) return;

    const loadTickets = async () => {
      const savedTickets = localStorage.getItem('tickets');
      if (savedTickets) {
        try {
          // Decrypt tickets from storage
          const decrypted = await decryptData(savedTickets, aesKey);
          setTickets(JSON.parse(decrypted));
        } catch (error) {
          console.error('Failed to decrypt tickets:', error);
          setStorageError('Failed to load tickets. Data may be corrupted or key is invalid.');
          setTickets([]);
        }
      }
    };
    loadTickets();
  }, [aesKey]); // Run when aesKey changes

  // Save to localStorage and sessionStorage whenever tickets change
  useEffect(() => {
    if (!aesKey || tickets.length === 0) return; // Skip if no tickets or no key

    const saveTickets = async () => {
      try {
        // Encrypt tickets before saving
        const encryptedTickets = await encryptData(JSON.stringify(tickets), aesKey);
        localStorage.setItem('tickets', encryptedTickets);
        sessionStorage.setItem('tickets', encryptedTickets);
      } catch (error) {
        console.error('Failed to encrypt and save tickets:', error);
        setStorageError('Failed to save tickets. Please try again.');
      }
    };
    saveTickets();
  }, [tickets, aesKey]); // Run when tickets or aesKey changes

  // Constants for attachment validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const maxSize = 2 * 1024 * 1024; // 2MB
  const maxFiles = 5;

  // Validate form fields and attachments
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TicketFormData, string>> = {};

    if (!formData.mainCategory.trim()) {
      newErrors.mainCategory = 'Main Category is required';
    }

    if (!formData.subCategory.trim()) {
      newErrors.subCategory = 'Sub Category is required';
    }

    if (!formData.problemIssue.trim()) {
      newErrors.problemIssue = 'Problem/Issue is required';
    }

    if (formData.description.trim() === '<p></p>' || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    // Validate attachments
    if (formData.attachments.length > maxFiles) {
      newErrors.attachments = `Maximum ${maxFiles} files allowed`;
    }

    formData.attachments.forEach((attachment) => {
      const validExtensions = ['jpg', 'jpeg', 'pdf', 'png'];
      const extension = attachment.name.split('.').pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        newErrors.attachments = 'Only .jpg, .jpeg, .pdf, .png files are allowed';
      }
      if (attachment.size > maxSize) {
        newErrors.attachments = 'File size must not exceed 2MB';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes for text fields
  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle file selection with validation
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: Attachment[] = [];
      const invalidFiles: string[] = [];

      Array.from(files).forEach(file => {
        if (!allowedTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} (invalid type)`);
          return;
        }
        if (file.size > maxSize) {
          invalidFiles.push(`${file.name} (size exceeds 2MB)`);
          return;
        }
        newAttachments.push({
          id: `${Date.now()}-${newAttachments.length}`,
          name: file.name,
          size: file.size,
          type: file.type
        });
      });

      if (formData.attachments.length + newAttachments.length > maxFiles) {
        setErrors(prev => ({ ...prev, attachments: `Maximum ${maxFiles} files allowed` }));
        return;
      }

      if (invalidFiles.length > 0) {
        setErrors(prev => ({ ...prev, attachments: `Invalid files: ${invalidFiles.join(', ')}` }));
      }

      setSelectedFiles(files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
      // Re-validate after adding attachments
      validateForm();
    }
  };

  // Remove an attachment by ID
  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
    // Re-validate after removing attachment
    validateForm();
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form submission for "Create" and "Create and add another"
  const handleSubmit = (event: React.FormEvent, addAnother: boolean = false) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!aesKey) {
      setStorageError('Cannot save ticket: Encryption key is missing.');
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
      handleReset();
    } else {
      alert('Ticket created successfully! Ready to add another.');
      handleReset();
    }
  };

  // Reset form to initial state
  const handleReset = () => {
    setFormData({
      mainCategory: '',
      subCategory: '',
      problemIssue: '',
      description: '<p></p>',
      attachments: []
    });
    setSelectedFiles(null);
    setErrors({});
    setStorageError(null); // Clear storage errors on reset
  };

  // Error icon component for validation messages
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

      {storageError && (
        <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <ErrorIcon />
          {storageError}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="ticket-form">
        <div className="form-group">
          <label htmlFor="mainCategory">Main Category *</label>
          <input
            id="mainCategory"
            value={formData.mainCategory}
            onChange={(e) => handleInputChange('mainCategory', e.target.value)}
            placeholder="Main Category"
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
            placeholder="Sub Category"
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
          <label htmlFor="problemIssue">Problem/Issue *</label>
          <input
            id="problemIssue"
            value={formData.problemIssue}
            onChange={(e) => handleInputChange('problemIssue', e.target.value)}
            placeholder="Problem/Issue"
            required
          />
          {errors.problemIssue && (
            <div style={{ color: 'red', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <ErrorIcon />
              {errors.problemIssue}
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
        <button type="button" onClick={handleReset} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TicketForm;
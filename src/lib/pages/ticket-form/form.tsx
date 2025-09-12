import React, { useState, useEffect } from 'react';
import TiptapEditor from './editor/tiptap-editor';
import './form.css';
import { AttachmentPinIcon } from '../../utils/icons';
import { encryptData, decryptData } from '../../utils/cryptoUtils';

// Types
export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  base64?: string; // Added base64 property for file content
}

interface TicketFormData {
  mainCategory: string;
  subCategory: string;
  problemIssue: string;
  description: string;
  attachments: Attachment[];
}

export interface Ticket extends TicketFormData {
  id: string;
  createdAt: string;
  status: string;
  source: string;
}

function TicketForm() {
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [, setSelectedFiles] = useState<FileList | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const aesKey = import.meta.env.VITE_AES_KEY;
  
  // Storage limits
  const maxSize = 1024 * 1024; // Reduced to 1MB per file
  const maxFiles = 3; // Reduced to 3 files
  const maxTotalStorageSize = 5 * 1024 * 1024; // 5MB total storage limit
  
  useEffect(() => {
    if (!aesKey) {
      console.error('VITE_AES_KEY is not defined in the .env file');
      setStorageError('Encryption key is missing. Please contact support.');
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (!aesKey) return;

    const loadTickets = async () => {
      const savedTickets = localStorage.getItem('tickets');
      if (savedTickets) {
        try {
          const decrypted = await decryptData(savedTickets, aesKey);
          const parsed = JSON.parse(decrypted);
          const updated = parsed.map((t: Ticket) => ({
            ...t,
            status: t.status || 'Open',
            source: t.source || 'Helpdesk'
          }));
          setTickets(updated);
        } catch (error) {
          console.error('Failed to decrypt tickets:', error);
          setStorageError('Failed to load tickets. Data may be corrupted or key is invalid.');
          setTickets([]);
        }
      }
    };
    loadTickets();
  }, [aesKey]);

  // Optimized save function with size checking
  const saveTicketsToStorage = async (ticketsToSave: Ticket[]) => {
    if (!aesKey) return;

    try {
      const ticketsJson = JSON.stringify(ticketsToSave);
      const jsonSize = new Blob([ticketsJson]).size;
      
      if (jsonSize > maxTotalStorageSize) {
        throw new Error(`Data size (${Math.round(jsonSize / 1024 / 1024 * 100) / 100}MB) exceeds maximum limit (${maxTotalStorageSize / 1024 / 1024}MB)`);
      }

      const encryptedTickets = await encryptData(ticketsJson, aesKey);
      localStorage.setItem('tickets', encryptedTickets);
      sessionStorage.setItem('tickets', encryptedTickets);
    } catch (error) {
      console.error('Failed to encrypt and save tickets:', error);
      setStorageError(error instanceof Error ? error.message : 'Failed to save tickets. Please try again.');
      throw error;
    }
  };

  useEffect(() => {
    if (!aesKey || tickets.length === 0) return;

    const saveTickets = async () => {
      try {
        await saveTicketsToStorage(tickets);
      } catch (error) {
        // Error handling is done in saveTicketsToStorage
      }
    };
    saveTickets();
  }, [tickets, aesKey]);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

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
        newErrors.attachments = `File size must not exceed ${maxSize / 1024 / 1024}MB`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessingFiles(true);
    const newAttachments: Attachment[] = [];
    const invalidFiles: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} (invalid type)`);
          continue;
        }
        if (file.size > maxSize) {
          invalidFiles.push(`${file.name} (size exceeds ${maxSize / 1024 / 1024}MB)`);
          continue;
        }

        // Convert file to base64
        let base64: string | undefined;
        try {
          base64 = await fileToBase64(file);
        } catch (error) {
          console.error('Error converting file to base64:', error);
          invalidFiles.push(`${file.name} (processing error)`);
          continue;
        }

        newAttachments.push({
          id: `${Date.now()}-${newAttachments.length}`,
          name: file.name,
          size: file.size,
          type: file.type,
          base64: base64
        });
      }

      if (formData.attachments.length + newAttachments.length > maxFiles) {
        setErrors(prev => ({ ...prev, attachments: `Maximum ${maxFiles} files allowed` }));
        setIsProcessingFiles(false);
        return;
      }

      if (invalidFiles.length > 0) {
        setErrors(prev => ({ ...prev, attachments: `Invalid files: ${invalidFiles.join(', ')}` }));
        if (newAttachments.length === 0) {
          setIsProcessingFiles(false);
          return;
        }
      } else {
        setErrors(prev => ({ ...prev, attachments: undefined }));
      }

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
      setSelectedFiles(files);
    } catch (error) {
      console.error('Error processing files:', error);
      setErrors(prev => ({ ...prev, attachments: 'Error processing files. Please try again.' }));
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
    validateForm();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (event: React.FormEvent, addAnother: boolean = false) => {
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
      createdAt: new Date().toISOString(),
      status: 'Open',
      source: 'Helpdesk'
    };

    try {
      const updatedTickets = [...tickets, newTicket];
      await saveTicketsToStorage(updatedTickets);
      setTickets(updatedTickets);
      setSuccessMessage('Ticket created successfully!');

      if (!addAnother) {
        setFormData({
          mainCategory: '',
          subCategory: '',
          problemIssue: '',
          description: '<p></p>',
          attachments: []
        });
        setSelectedFiles(null);
        setErrors({});
      } else {
        setFormData({
          mainCategory: '',
          subCategory: '',
          problemIssue: '',
          description: '<p></p>',
          attachments: []
        });
        setSelectedFiles(null);
        setErrors({});
        setSuccessMessage('Ticket created successfully! Ready to add another.');
      }
    } catch (error) {
      // Error message is already set in saveTicketsToStorage
    }
  };

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
    setStorageError(null);
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

  const SuccessIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '4px', verticalAlign: 'middle' }}
    >
      <circle cx="8" cy="8" r="7" stroke="green" strokeWidth="1.5" />
      <path d="M5 8.5L7.5 11L11 6" stroke="green" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
              disabled={isProcessingFiles}
            />
            <button
              type="button"
              onClick={() => document.getElementById('fileInput')?.click()}
              className="attach-button"
              disabled={isProcessingFiles}
            >
              {isProcessingFiles ? 'Processing Files...' : 'Select Files'}
            </button>
            <div className="attachment-instruction">
              <div>
                Allowed file extensions: <span className="bold-text">.jpg, .jpeg, .pdf, .png</span>
              </div>
              <div>
                Maximum File Size: <span className="bold-text">{maxSize / 1024 / 1024}MB</span>
              </div>
              <div>
                Maximum No. of Files: <span className="bold-text">{maxFiles}</span>
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
                      <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M0.950139 0.46967C1.24303 0.176777 1.71791 0.176777 2.0108 0.46967L5.48047 3.93934L8.95014 0.46967C9.24303 0.176777 9.71791 0.176777 10.0108 0.46967C10.3037 0.762563 10.3037 1.23744 10.0108 1.53033L6.54113 5L10.0108 8.46967C10.3037 8.76256 10.3037 9.23744 10.0108 9.53033C9.71791 9.82322 9.24303 9.82322 8.95014 9.53033L5.48047 6.06066L2.0108 9.53033C1.71791 9.82322 1.24303 9.82322 0.950139 9.53033C0.657245 9.23744 0.657245 8.76256 0.950139 8.46967L4.41981 5L0.950139 1.53033C0.657245 1.23744 0.657245 0.762563 0.950139 0.46967Z" fill="#C92A2A"/>
                      </svg>
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
      {successMessage && (
        <div style={{ color: 'green', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', border: '2px solid Green', padding: '4px 10px' }}>
          <SuccessIcon />
          {successMessage}
        </div>
      )}
      <div className="form-actions">
        <button type="submit" onClick={(e) => handleSubmit(e)} className="create-button" disabled={isProcessingFiles}>
          Create
        </button>
        <button type="button" onClick={(e) => handleSubmit(e, true)} className="create-assign-button" disabled={isProcessingFiles}>
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
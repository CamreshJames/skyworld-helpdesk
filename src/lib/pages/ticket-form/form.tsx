import React, { useState } from 'react';
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

function TicketForm() {
  const [formData, setFormData] = useState<TicketFormData>({
    mainCategory: '',
    subCategory: '',
    projectPhase: '',
    description: '<p>Hello <strong>World!</strong></p>',
    attachments: []
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Main categories and their sub-categories
  const categoryMap = {
    'Bug Report': ['UI/UX Issues', 'Functional Issues', 'Performance Issues'],
    'Feature Request': ['New Feature', 'Enhancement', 'Integration'],
    'Technical Support': ['Configuration', 'Installation', 'Troubleshooting'],
    'Documentation': ['Missing Info', 'Incorrect Info', 'Update Request']
  };

  const projectPhases = [
    'Planning',
    'Development',
    'Testing',
    'Deployment',
    'Maintenance'
  ];

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'mainCategory' && { subCategory: '' })
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);

      // Convert FileList to Attachment array
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
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.mainCategory || !formData.subCategory || !formData.projectPhase) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Ticket Data:', formData);
    alert('Ticket created successfully!');
  };

  const handleCancel = () => {
    setFormData({
      mainCategory: '',
      subCategory: '',
      projectPhase: '',
      description: '<p>Hello <strong>World!</strong></p>',
      attachments: []
    });
    setSelectedFiles(null);
  };

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <h2>Create Ticket</h2>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="mainCategory">Main Category *</label>
          <select
            id="mainCategory"
            value={formData.mainCategory}
            onChange={(e) => handleInputChange('mainCategory', e.target.value)}
            required
          >
            <option value="">Select...</option>
            {Object.keys(categoryMap).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="subCategory">Sub Category *</label>
          <select
            id="subCategory"
            value={formData.subCategory}
            onChange={(e) => handleInputChange('subCategory', e.target.value)}
            disabled={!formData.mainCategory}
            required
          >
            <option value="">Select...</option>
            {formData.mainCategory && categoryMap[formData.mainCategory as keyof typeof categoryMap]?.map(subCat => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="projectPhase">Project Phase *</label>
          <select
            id="projectPhase"
            value={formData.projectPhase}
            onChange={(e) => handleInputChange('projectPhase', e.target.value)}
            required
          >
            <option value="">Select...</option>
            {projectPhases.map(phase => (
              <option key={phase} value={phase}>{phase}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <TiptapEditor
            content={formData.description}
            onChange={(content) => handleInputChange('description', content)}
          />
        </div>

        <div className="form-group">
          <label>Attachments</label>
          <div className="attachment-section">
            <input
              type="file"
              id="fileInput"
              multiple
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
                    <AttachmentPinIcon/>
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
          </div>
        </div>
      </form>
      <div className="form-actions">
          <button type="submit" className="create-button">
            Create
          </button>
          <button type="button" onClick={handleSubmit} className="create-assign-button">
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
import { useState } from 'react';
import {
  X, MessageCircle, Camera, Rocket, Calendar, BookOpen, HelpCircle,
  Upload, Plus, Trash2
} from 'lucide-react';
import { supabase, uploadFile } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { LoadingSpinner } from '../ui';
import type { PostType, Mode } from '../../types';

interface CreatePostModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const postTypes: { value: PostType; label: string; icon: typeof MessageCircle }[] = [
  { value: 'thought', label: 'Thought', icon: MessageCircle },
  { value: 'photo', label: 'Photo', icon: Camera },
  { value: 'project', label: 'Project', icon: Rocket },
  { value: 'event', label: 'Event', icon: Calendar },
  { value: 'resource', label: 'Resource', icon: BookOpen },
  { value: 'question', label: 'Question', icon: HelpCircle },
];

const modes: { value: Mode; label: string }[] = [
  { value: 'study', label: 'Study' },
  { value: 'social', label: 'Social' },
  { value: 'project', label: 'Project' },
];

export const CreatePostModal = ({ onClose, onCreated }: CreatePostModalProps) => {
  const { user, currentMode } = useUserStore();
  const [postType, setPostType] = useState<PostType>('thought');
  const [modeContext, setModeContext] = useState<Mode>(currentMode);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [projectTitle, setProjectTitle] = useState('');
  const [rolesNeeded, setRolesNeeded] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventRsvpLink, setEventRsvpLink] = useState('');

  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [resourceTags, setResourceTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const addRole = () => {
    if (newRole.trim() && !rolesNeeded.includes(newRole.trim())) {
      setRolesNeeded([...rolesNeeded, newRole.trim()]);
      setNewRole('');
    }
  };

  const removeRole = (role: string) => {
    setRolesNeeded(rolesNeeded.filter((r) => r !== role));
  };

  const addTag = () => {
    if (newTag.trim() && !resourceTags.includes(newTag.trim())) {
      setResourceTags([...resourceTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setResourceTags(resourceTags.filter((t) => t !== tag));
  };

  const canSubmit = () => {
    switch (postType) {
      case 'thought':
        return content.trim().length > 0;
      case 'photo':
        return imageFile !== null;
      case 'project':
        return projectTitle.trim().length > 0 && content.trim().length > 0;
      case 'event':
        return eventTitle.trim().length > 0 && eventDate;
      case 'resource':
        return resourceTitle.trim().length > 0 && resourceLink.trim().length > 0;
      case 'question':
        return content.trim().length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !canSubmit()) return;

    setIsLoading(true);
    setError('');

    try {
      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadFile('post-images', imageFile, user.id);
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const postData: Record<string, unknown> = {
        author_id: user.id,
        post_type: postType,
        mode_context: modeContext,
        content: content.trim() || null,
        image_url: imageUrl,
      };

      if (postType === 'project') {
        postData.project_title = projectTitle.trim();
        postData.roles_needed = rolesNeeded;
      }

      if (postType === 'event') {
        postData.event_title = eventTitle.trim();
        postData.event_date = eventDate;
        postData.event_location = eventLocation.trim() || null;
        postData.event_rsvp_link = eventRsvpLink.trim() || null;
      }

      if (postType === 'resource') {
        postData.resource_title = resourceTitle.trim();
        postData.resource_link = resourceLink.trim();
        postData.resource_tags = resourceTags;
      }

      const { error: insertError } = await supabase.from('posts').insert(postData);

      if (insertError) throw insertError;

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <h2 className="text-lg font-semibold text-slate-900">Create Post</h2>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || isLoading}
            className="text-primary-600 font-semibold disabled:text-slate-300"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Post'}
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Post Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setPostType(type.value)}
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                      ${postType === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${postType === type.value ? 'text-primary-600' : 'text-slate-500'}`} />
                    <span className={`text-xs font-medium ${postType === type.value ? 'text-primary-600' : 'text-slate-600'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mode
            </label>
            <div className="flex gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setModeContext(mode.value)}
                  className={`
                    flex-1 py-2 rounded-lg font-medium text-sm transition-all
                    ${modeContext === mode.value
                      ? `bg-${mode.value} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {postType === 'project' && (
            <div className="space-y-4">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Project title"
                className="input"
                maxLength={100}
              />
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                    placeholder="Add role needed (e.g., Designer)"
                    className="input flex-1"
                  />
                  <button onClick={addRole} className="btn-secondary px-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {rolesNeeded.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {rolesNeeded.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-sm"
                      >
                        {role}
                        <button onClick={() => removeRole(role)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {postType === 'event' && (
            <div className="space-y-4">
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="input"
                maxLength={100}
              />
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input"
              />
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Location (optional)"
                className="input"
              />
              <input
                type="url"
                value={eventRsvpLink}
                onChange={(e) => setEventRsvpLink(e.target.value)}
                placeholder="RSVP link (optional)"
                className="input"
              />
            </div>
          )}

          {postType === 'resource' && (
            <div className="space-y-4">
              <input
                type="text"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                placeholder="Resource title"
                className="input"
                maxLength={100}
              />
              <input
                type="url"
                value={resourceLink}
                onChange={(e) => setResourceLink(e.target.value)}
                placeholder="Resource URL"
                className="input"
              />
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag (e.g., math)"
                    className="input flex-1"
                  />
                  <button onClick={addTag} className="btn-secondary px-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {resourceTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {resourceTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-sm"
                      >
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'question'
                  ? 'Ask your question...'
                  : postType === 'photo'
                  ? 'Add a caption (optional)'
                  : "What's on your mind?"
              }
              className="input min-h-24 resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-slate-500">{content.length}/500</p>
          </div>

          <div>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">Add an image</p>
                  <p className="text-xs text-slate-400">Max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const EditURLDialog = ({ isOpen, onClose, url, onUpdate }) => {
  const [customAlias, setCustomAlias] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (url) {
      setCustomAlias(url.customAlias || '');
      setDescription(url.description || '');
    }
  }, [url]);

  const handleUpdate = () => {
    onUpdate({
      customAlias,
      description
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit URL</DialogTitle>
          <DialogDescription>
            Update the details of your shortened URL
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="editCustomAlias">Custom Alias</Label>
            <Input
              id="editCustomAlias"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="editDescription">Description</Label>
            <Textarea
              id="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdate}>
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default EditURLDialog
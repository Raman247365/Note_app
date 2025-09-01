import { Request, Response } from 'express';
import Note from '../models/Note';

interface AuthRequest extends Request {
  userId?: string;
}

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const note = new Note({ userId: req.userId, title, content });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Note.findOneAndDelete({ _id: id, userId: req.userId });

    if (!result) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
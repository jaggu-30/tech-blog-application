import {
  createBlog,
  findAllBlogs,
  findBlogsByAuthor,
  findBlogById,
  deleteBlogById
} from '../models/Blog.js';

export async function createBlogHandler(req, res, next) {
  try {
    const { title, category, content } = req.body;

    if (!title?.trim() || !category?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and content are required.'
      });
    }

    const blog = createBlog({
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      authorId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Blog published successfully.',
      blog
    });
  } catch (error) {
    next(error);
  }
}

export async function getBlogs(req, res, next) {
  try {
    const blogs = findAllBlogs();

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyBlogs(req, res, next) {
  try {
    const blogs = findBlogsByAuthor(req.user._id);

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    next(error);
  }
}

export async function getBlogByIdHandler(req, res, next) {
  try {
    const blog = findBlogById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      });
    }

    res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBlogHandler(req, res, next) {
  try {
    const blog = findBlogById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      });
    }

    if (blog.authorId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this blog.'
      });
    }

    deleteBlogById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

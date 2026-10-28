const Task = require('../models/task.model')

// POST /tasks — Create task
const createTask = async(req, res)=> {
    try {
        const { title, description, priority, dueDate } = req.body;
        if (!title || !description || !priority || !dueDate) {
            return res.status(422).json({
                success: false,
                message: "Title and due date are required"
            })   
        }

        const task = await Task.create({
            owner_id: req.user._id,
            title,
            description,
            priority,
            dueDate
        })
        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// GET /tasks — Fetch logged-in user's all tasks
const getTask = async(req, res) => {
    try {
        const tasks = await Task.find({
        owner_id: req.user. _id
        }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tasks"
        }); 
    }
}

// GET /tasks — Fetch logged-in user's all tasks
const getOneTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userTask = await Task.findOne({
            _id: id,
            owner_id: req.user._id
        }); 
        if(!userTask) {
            return res.status(404).json({
                            success: false,
                            message: "Task not found"
                        });
        }
        return res.status(200).json({
            success: true,
            userTask
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// GET /tasks/:id — edit the specific task
const updatetask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, dueDate } = req.body;

        const task = await Task.findOneAndUpdate(
            {
                _id: id,
                owner_id: req.user._id
            },
            {
                $set: {
                    ...(title !== undefined && { title }),
                    ...(description !== undefined && { description }),
                    ...(priority !== undefined && { priority }),
                    ...(dueDate !== undefined && { dueDate })
                }
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        )
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update task"
        });
    }
}

// delete — edit the specific task
const deleteTask = async (req, res)=> {
    try {
        const { id } = req.params.id;
        const task = Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        })
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found or you do not own this task",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID" || error.message
        });
    }
}

module.exports = { createTask, getTask, updatetask, getOneTask, deleteTask }
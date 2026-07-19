const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    expenseDate: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    billFile: {
      url: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
    },
    createdByName: { type: String, required: true, trim: true },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Approved', // Set to 'Pending' if approval workflow is enabled for a project
    },
  },
  { timestamps: true }
);

expenseSchema.index({ project: 1, expenseDate: -1 });

module.exports = mongoose.model('Expense', expenseSchema);

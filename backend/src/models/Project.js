const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    siteAddress: { type: String, trim: true },
    assignedEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date, required: true },
    totalEstimationAmount: { type: Number, required: true, min: 0 },
    initialInvestedAmount: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['Planning', 'Ongoing', 'Completed', 'On Hold'],
      default: 'Planning',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Total expenses is derived from the Expense collection, not stored directly,
// to avoid drift. Controllers populate `totalExpenses` via aggregation when needed.
projectSchema.virtual('remainingBudget').get(function computeRemaining() {
  const spent = this._totalExpenses || 0;
  return this.totalEstimationAmount - spent;
});

projectSchema.virtual('budgetUtilizationPercent').get(function computeUtilization() {
  if (!this.totalEstimationAmount) return 0;
  const spent = this._totalExpenses || 0;
  return Math.round((spent / this.totalEstimationAmount) * 10000) / 100;
});

projectSchema.index({ status: 1 });
projectSchema.index({ assignedEngineer: 1 });

module.exports = mongoose.model('Project', projectSchema);

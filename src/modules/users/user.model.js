import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
      
    email: { type: String, required: true, lowercase: true, trim: true },    
      
    password: { type: String, required: true, minlength: 6, select: false },

    role: { type: String, enum: ["admin", "agent", "requester"], default: "requester" }, 

    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true }, 

    isActive: { type: Boolean, default: true, index: true},
  },{ timestamps: true }
);

// Same email allowed in different organizations,
// but not twice inside the same organization.
userSchema.index(
  { organizationId: 1, email: 1 },
  { unique: true }
);

const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },

        slug: { type: String, required: true,  trim: true, lowercase: true, unique: true,index:true },
   
        description: { type: String, trim: true, maxlength: 500, default: "" },
      
        isActive: { type: Boolean, default: true, index: true },
    },
    {timestamps: true}
);

export default mongoose.model("Organization", organizationSchema);
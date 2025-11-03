import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://metrohrms.netlify.app/unknown.jpeg",
    },
    qrCode: String,
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
    dateOfJoining: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    martialStatus: {
      type: String,
      enum: ["Single", "Married"],
      required: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract"],
      required: true,
    },
    shift: {
      type: mongoose.Schema.Types.Mixed, // Accept both ObjectId and String
      ref: "Shift",
      default: null,
    },
    shiftLegacy: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Leave"],
      default: "Active",
    },
    salary: {
      type: Number,
      required: true,
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },
    leaveBalance: {
      type: Number,
      default: 0,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    forgetPasswordToken: String,
    faceDescriptor: {
      type: [Number],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to convert string shift values to ObjectId
employeeSchema.pre("save", async function (next) {
  if (this.isModified("shift") && this.shift) {
    // If shift is a string, convert it to ObjectId
    if (typeof this.shift === "string") {
      const Shift = mongoose.model("Shift");
      // Try both formats: "Morning" and "Morning Shift"
      let shiftDoc = await Shift.findOne({ name: this.shift });
      if (!shiftDoc) {
        shiftDoc = await Shift.findOne({ name: `${this.shift} Shift` });
      }
      if (shiftDoc) {
        this.shift = shiftDoc._id;
      } else {
        this.shift = null;
      }
    }
  }
  next();
});

// Pre-update middleware to convert string shift values to ObjectId
employeeSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], async function (next) {
  const update = this.getUpdate();
  
  // Handle both direct update and $set operator
  const shiftValue = update.$set?.shift || update.shift;
  
  if (shiftValue && typeof shiftValue === "string") {
    const Shift = mongoose.model("Shift");
    // Try both formats: "Morning" and "Morning Shift"
    let shiftDoc = await Shift.findOne({ name: shiftValue });
    if (!shiftDoc) {
      shiftDoc = await Shift.findOne({ name: `${shiftValue} Shift` });
    }
    
    if (shiftDoc) {
      if (update.$set) {
        update.$set.shift = shiftDoc._id;
      } else {
        update.shift = shiftDoc._id;
      }
    } else {
      if (update.$set) {
        update.$set.shift = null;
      } else {
        update.shift = null;
      }
    }
  }
  
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;

const Company = require("../models/Company.model");
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

// ✅ REGISTER COMPANY (OWNER FLOW)
const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      address,
      phone,
      website,
      description,
      ownerName,
      email,
      password,
    } = req.body;

    // 1️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create company first (owner null for now)
    const company = await Company.create({
      name: companyName,
      address,
      phone,
      website,
      description,
      isActive: true,
    });

    // 4️⃣ Create owner user
    const owner = await User.create({
      name: ownerName,
      email,
      password: hashedPassword,
      role: "owner",
      phone,
      company: company._id,
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    });

    // 5️⃣ Assign owner to company & save
    company.owner = owner._id;
    await company.save();

    // 6️⃣ Populate owner for response
    const populatedCompany = await Company.findById(company._id).populate(
      "owner",
      "name email"
    );

    res.status(201).json({
      message: "Company registered successfully",
      company: populatedCompany,
      owner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET COMPANIES (ROLE BASED)
const getCompanies = async (req, res) => {
  try {
    let companies;

    // 🔥 SUPERADMIN → ALL
    if (req.user.role === "superadmin") {
      companies = await Company.find().populate("owner", "name email");
    }
    // 🔥 OWNER → ONLY OWN COMPANY
    else {
      companies = await Company.find({
        _id: req.user.company,
      }).populate("owner", "name email");
    }

    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const updateCompany = async (req, res) => {
  try {
    // 1️⃣ Get all fields including owner
    const {
      name,
      address,
      phone,
      website,
      description,
      ownerName,
      ownerEmail,
      isActive,
    } = req.body;

    // 2️⃣ Find company
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // 3️⃣ Update company fields
    company.name = name;
    company.address = address;
    company.phone = phone;
    company.website = website;
    company.description = description;
    company.isActive = isActive; 

    await company.save();

    // 4️⃣ Update owner fields
    if (company.owner) {
      await User.findByIdAndUpdate(company.owner, {
        name: ownerName,
        email: ownerEmail,
      });
    }

    // 5️⃣ Return updated company with populated owner
    const updatedCompany = await Company.findById(company._id).populate(
      "owner",
      "name email",
    );

    res.json(updatedCompany);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    await company.deleteOne();

    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkSubscriptionStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);

    if (!company?.subscription) {
      return res.json({ active: false });
    }

    const isExpired =
      new Date() > new Date(company.subscription.endDate);

    res.json({
      active: !isExpired,
      endDate: company.subscription.endDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  registerCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  checkSubscriptionStatus,
};

import Role from "../models/role.model";

// seed/roles.seed.ts
async function seedRoles() {
  const defaults = [
    { name: "user", permissions: ["profile:read", "profile:update"] },
    { name: "seller", permissions: ["product:create", "order:manage"] },
    { name: "admin", permissions: ["*"] },
    // ...
  ];

  for (const roleData of defaults) {
    await Role.findOneAndUpdate({ name: roleData.name }, roleData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  console.log("Roles seeded");
}

// In your main server file (index.ts / app.ts)
async function bootstrap() {
  //   await connectDB();
  //   await seedRoles();           // runs once-ish
  // ...
}

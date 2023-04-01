const OjassId = require("../models/ojassId");

const randomIdGenerator = async (initials) => {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const ojassId = `OJ-${initials}-${randomId}`;
  const existingId = await OjassId.findOne({ id: ojassId });
  if (existingId) randomIdGenerator();
  else {
    const newRandomId = new OjassId({
      id: ojassId,
    });
    await newRandomId.save();
    return newRandomId.id;
  }
};

module.exports = randomIdGenerator;

const OjassId = require("../models/ojassId");

const randomIdGenerator = async (initials, schoolType) => {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const studentStatus =
    schoolType === "school" ? 0 : schoolType === "nitjsr" ? 1 : 2;
  const ojassId = `OJ-${initials}-${studentStatus}-${randomId}`;
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

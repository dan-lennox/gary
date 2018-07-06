module.exports = {
  botTableName: 'todobotDev',
  // Define an the Azure Table for storing chat user addresses. (Required for proactive messaging).
  addressesTableName: 'todobotAddressesDev',
  // Define the Azure Table Partition. Azure Table Storage is designed for big data and so allows
  // table partitioning. Pretty sure we just need the one partition for this little app!
  botTablePartition: 'part1',
  addressesTablePartition: 'part1'
};
const useEvents = async (tx, event) => {
  const receipt = await tx.wait(1);
  let events = receipt.events.filter((i) => i.event == event);
  events = events.map((event) => event.args);
  return events;
};

module.exports = useEvents;

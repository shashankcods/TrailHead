// // src/agents/events/providers/eventbrite.js
// import axios from "axios";

// export const getEventsFromEventbrite = async (location, startDate, endDate) => {
//   try {
//     const query = `
//       query SearchEvents($q: String!) {
//         events(q: $q, first: 20) {
//           edges {
//             node {
//               name { text }
//               start { utc }
//               end { utc }
//               venue {
//                 name
//                 address { localized_address_display }
//               }
//             }
//           }
//         }
//       }
//     `;

//     const res = await axios.post("https://www.eventbrite.com/api/v3/graphql/", {
//       query,
//       variables: { q: location },
//     }, {
//       headers: { "Content-Type": "application/json" },
//     });

//     const edges = res.data?.data?.events?.edges || [];
//     if (!edges.length) {
//       console.warn(`No Eventbrite GraphQL events found for ${location}`);
//       return [];
//     }

//     return edges.map(({ node }) => ({
//       source: "Eventbrite (GraphQL)",
//       title: node.name?.text,
//       category: "general",
//       start: node.start?.utc,
//       end: node.end?.utc,
//       location: node.venue?.name || node.venue?.address?.localized_address_display || location,
//     }));
//   } catch (err) {
//     console.error("Eventbrite GraphQL Error:", err.message);
//     return [];
//   }
// };
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
console.log("DNS override active: ", dns.getServers());
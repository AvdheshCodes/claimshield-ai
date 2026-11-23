// InsureGuard AI — Neo4j Graph Schema & Fraud Ring Seeds
// Version: 2.0 (PRD Aligned)

// 1. Constraints for Uniqueness
CREATE CONSTRAINT customer_id_unique IF NOT EXISTS FOR (c:Customer) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT claim_number_unique IF NOT EXISTS FOR (cl:Claim) REQUIRE cl.claim_number IS UNIQUE;
CREATE CONSTRAINT vehicle_reg_unique IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.registration IS UNIQUE;
CREATE CONSTRAINT phone_number_unique IF NOT EXISTS FOR (p:Phone) REQUIRE p.number IS UNIQUE;
CREATE CONSTRAINT email_unique IF NOT EXISTS FOR (e:Email) REQUIRE e.address IS UNIQUE;
CREATE CONSTRAINT hospital_name_unique IF NOT EXISTS FOR (h:Hospital) REQUIRE h.name IS UNIQUE;
CREATE CONSTRAINT garage_name_unique IF NOT EXISTS FOR (g:Garage) REQUIRE g.name IS UNIQUE;
CREATE CONSTRAINT doctor_reg_unique IF NOT EXISTS FOR (d:Doctor) REQUIRE d.reg_no IS UNIQUE;

// 2. Indexes for Performance
CREATE INDEX claim_incident_date_idx IF NOT EXISTS FOR (cl:Claim) ON (cl.incident_date);
CREATE INDEX claim_risk_score_idx IF NOT EXISTS FOR (cl:Claim) ON (cl.risk_score);

// -------------------------------------------------------------
// 3. Synthetic Fraud Ring Seed Data (Demonstration Scenario)
// Network of 3 connected claims sharing phone, vehicle & garage
// -------------------------------------------------------------

// Create Entities
MERGE (c1:Customer {id: "cust-001", name: "Priya Verma", risk_tag: "HIGH"})
MERGE (c2:Customer {id: "cust-002", name: "Suresh Gupta", risk_tag: "SUSPICIOUS"})
MERGE (c3:Customer {id: "cust-003", name: "Vikram Malhotra", risk_tag: "SUSPICIOUS"})

MERGE (cl1:Claim {claim_number: "CS-2026-00002", amount: 95000, date: "2024-10-20", status: "UNDER_INVESTIGATION", risk_score: 85})
MERGE (cl2:Claim {claim_number: "CS-2026-00004", amount: 88000, date: "2024-09-12", status: "APPROVED", risk_score: 45})
MERGE (cl3:Claim {claim_number: "CS-2026-00007", amount: 110000, date: "2024-11-05", status: "UNDER_INVESTIGATION", risk_score: 78})

MERGE (v1:Vehicle {registration: "DL05MN5678", make: "Hyundai", model: "Creta"})
MERGE (v2:Vehicle {registration: "DL05MN9999", make: "Hyundai", model: "Creta"})

MERGE (g1:Garage {name: "Metro Speed Auto Garage", license: "GAR-DEL-9921", location: "Connaught Place, Delhi"})
MERGE (p1:Phone {number: "+919876500001", carrier: "Airtel"})

// Create Relationships
MERGE (c1)-[:SUBMITTED]->(cl1)
MERGE (c2)-[:SUBMITTED]->(cl2)
MERGE (c3)-[:SUBMITTED]->(cl3)

MERGE (c1)-[:OWNS]->(v1)
MERGE (c2)-[:OWNS]->(v2)

MERGE (cl1)-[:INVOLVES_VEHICLE]->(v1)
MERGE (cl2)-[:INVOLVES_VEHICLE]->(v2)
MERGE (cl3)-[:INVOLVES_VEHICLE]->(v1) // Collision anomaly: Same vehicle involved in multiple recent claims

MERGE (cl1)-[:REPAIRED_AT]->(g1)
MERGE (cl2)-[:REPAIRED_AT]->(g1)
MERGE (cl3)-[:REPAIRED_AT]->(g1) // Syndicate anomaly: Repeated claims funnelled into identical garage

MERGE (c1)-[:SHARES_CONTACT]->(p1)
MERGE (c2)-[:SHARES_CONTACT]->(p1) // Fraud ring: Different claimants registered with identical contact phone

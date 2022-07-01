const db = require("./db");

const Query = {
    greeting: (root, {name}) => `Hello ${name}`,
    jobs: (root, {limit}) => db.jobs.list().slice(0, parseInt(limit)),
    job: (root, {id}) => db.jobs.get(id),
    company: (root, {id}) => db.companies.get(id),
}

const Mutation = {
    createJob: (root, {input}, {user}) => {
        if (!user) {
            throw new Error("You must be logged in to create a job");
        }
        const userId = user.sub;
        input.companyId = db.users.get(userId).companyId;
        const newJobId = db.jobs.create(input)
        return db.jobs.get(newJobId)
    },
}
const Job = {
    company: (job) => db.companies.get(job.companyId)
}
const Company = {
    jobs: (company) => db.jobs.list().filter(job => job.companyId === company.id)
}

module.exports = {Query, Job, Company, Mutation}
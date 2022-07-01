import React, {Component} from 'react';
import {loadCompany} from "./requests";
import {JobList} from "./JobList";

export class CompanyDetail extends Component {
    constructor(props) {
        super(props);
        const {companyId} = this.props.match.params;
        this.state = {
            companyId,
            company: null,
        }
    }

    async componentDidMount() {
        const company = await loadCompany(this.state.companyId);
        this.setState({company});
    }

    //list of jobs currently available at this company

    render() {
        const {company} = this.state;
        return (
            <>
                {company && (
                    <>
                        <div>
                            <h1 className="title">{company.name}</h1>
                            <div className="box">{company.description}</div>
                        </div>
                        <section>
                            <h1 className="title is-4 m-4">Jobs at {company.name}</h1>
                            <JobList jobs={company.jobs}/>
                        </section>
                    </>
                )}
            </>
        );
    }
}

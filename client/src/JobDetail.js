import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import { jobs } from './fake-data';
import {loadJob} from "./requests";

export class JobDetail extends Component {
  constructor(props) {
    super(props);
    const {jobId} = this.props.match.params;
    this.state = {
        id: jobId,
        job:null,
    }
  }


    async componentDidMount() {
        const job = await loadJob(this.state.id);
        this.setState({job});
    }

  render() {
    const {job} = this.state;
    return (
        <>
            {job && (
            <div>
                <h1 className="title">{job.title}</h1>
                <h2 className="subtitle">
                    <Link to={`/companies/${job.company.id}`}>{job.company.name}</Link>
                </h2>
                <div className="box">{job.description}</div>
            </div>
            )}
        </>

    );
  }
}

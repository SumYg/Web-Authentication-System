
// Importing combination
import React, {Component} from 'react';

class DocPage extends Component {
    constructor(props) {
        super(props)
        this.state = {userid: props.userid, dochash: props.docid, docid: "loading"}
    }

    componentDidMount() {
        const hash = this.state.dochash
        // alert("777777")
        fetch('http://localhost:8000/doc?secret='+hash, {
        credentials: "include"
        }).then(response=>{
        if (response.status === 200) {
            response.json().then( res=> {
                // alert(res.err+"<-Err")
                if (res.err === 0) {
                    // alert(res.id)
                    this.setState({userid: this.state.userid, dochash: this.props.dochash, docid: res.id})
                } else if (res.err === 1) {
                    alert(res.errMessage)
                    console.log(res.errMessage)
                    this.setState({userid: this.state.userid, dochash: this.props.dochash, docid: "Error"})
                } else if (res.err === 2) {
                    this.setState({userid: this.state.userid, dochash: this.props.dochash, docid: "not found"})
                }
            })
        }
        })
    }

    render() {
        return <h1>User {this.state.userid} is viewing document {this.state.docid}</h1>
    }
}



export default DocPage;
import { Component } from 'react'

class Interval extends Component {
  constructor(props) {
    super(props)
    this.state = props.run()
  }

  componentDidMount() {
    this.handle = setInterval(() => {
      this.setState(this.props.run())
    }, this.props.interval)
  }

  componentWillUnmount() {
    clearInterval(this.handle)
  }

  render() {
    return this.props.render({ ...this.state })
  }
}

export default Interval

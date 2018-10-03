import React from 'react';
import { Button, Select } from 'antd';
import { debounce } from 'underscore';

const Option = Select.Option;

class DefaultService extends React.Component {

  constructor(props) {
    super(props);

    this.submitAction = this.submitAction.bind(this);
    this.updateValid  = this.updateValid.bind(this);
    this.updateValid  = debounce(this.updateValid, 500);
    this.mockValue    = this.mockValue.bind(this);
    
    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.state = {
        isLoading: true,
        methodName: "",
        paramString: "{}",
        inputValid: true
    };
  }

  componentDidMount() {
    const { services } = this.props.protobufClient;
    const methodNames = Object.keys(services[Object.keys(services)[0]].methods);

    this.setState({ 
      methods: methodNames, 
      isLoading: false
    });
  }

  isComplete() {
    if (this.props.jobResult === undefined)
        return false;
    else {
        return true;
    }
  }

  updateValid() {
    let inputValid = true;
    
    try {
        JSON.parse(this.state.paramString);
    } catch(e) {
        inputValid = false;
    }
    
    if (this.state.methodName.length == 0)
        inputValid = false;
        
    this.setState({
        inputValid: inputValid
    });
  }

  mockValue(type, repeated) {
    let defaultValue = "";

    if (repeated) {
      //TODO handle array types
      //It's an array of type
    }
    if (type === "string") {
      defaultValue = new String();
    }

    if (type === "bool") {
      defaultValue = new Boolean();
    }

    if (type === "float" || type === "double") {
      defaultValue = new Number();
    }

    if (type === "bytes") {
      defaultValue = new Uint8Array();
    }

    console.log(defaultValue);
    return defaultValue;
  }

  handleSelectChange(value) {
    const { methods } = this.state

    if (value && value.length > 0 && methods.includes(value)) {

      const { services } = this.props.protobufClient;
      const requestType = services[Object.keys(services)[0]].methods[value].RequestType;

      let fields = {};
      Object.entries(requestType.fields).forEach(([fieldKey, fieldValue]) => {
        fieldValue = this.mockValue(fieldValue.type);
        Object.assign(fields, {[fieldKey] : fieldValue});
      });

      const paramString = JSON.stringify(fields, undefined, 2);

      this.setState({
        methodName: value,
        paramString
      });

    } else { 
      this.setState({ inputValid: false });
    }
  }
  
  handleChange(type, e) {
    this.setState({
        [type]: e.target.value,
    });
    this.updateValid();
  }

  submitAction() {
    this.props.showModalCallback(this.props.callModal);
    this.props.callApiCallback(
      this.state.methodName, 
      JSON.parse(this.state.paramString),
      true
    );
  }

  renderForm() {
    return(
        <React.Fragment>
        <div>
        <label>
          Method name: 

            <Select
              style={{ width: 300 }}
              placeholder="Select a method"
              defaultValue={this.state.methodName}
              onChange={this.handleSelectChange}
            >
              {this.state.methods.map(methodName => <Option key={methodName} value={methodName}>{methodName}</Option>)}
            </Select>
        </label>
        <br/>
        <label style={{width:"100%"}}>
          Params (as JSON):
          <textarea style={{width:"100%", minHeight: "300px"}} onChange={ this.handleChange.bind(this, 'paramString')} value={this.state.paramString} />
        </label>
            
        <br/>
        <Button type="primary" onClick={() => {this.submitAction(); }} disabled={!this.state.inputValid} >Call Agent API</Button>
        </div>
        </React.Fragment>
        )
  }
  
  renderComplete() {
    let jsonResult = JSON.stringify(this.props.jobResult);
    return(
      <div>
        <textarea style={{width:"100%"}} rows="4" readOnly value={jsonResult}/>
      </div>
    );
  }


  renderDescription() {
    return(
      <div>
          <p>
          This service is missing a customised UI.

          Eventually service authors will be able to publish a API model that will
          allow an automatically generated interface, and optionally provide a
          manually designed one.
          
          For now, you need to find documentation for the service, and ensure you
          call the correct method with the correct parameters.
          </p>
      </div>
    )
  }

  render() {
    if (this.state.isLoading) return null;
    if (this.isComplete())
        return (
            <div>
            { this.renderDescription() }
            { this.renderComplete() }
            </div>
        );
    else
        return (
            <div>
            { this.renderDescription() }
            { this.renderForm() }
            </div>
        )  
  }
}

export default DefaultService;
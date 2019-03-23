

class eegLoad {
    
    constructor(){
        this.bufferSize = 2000;
        this.weight = 0.9;
        this.buffer = [];
        this.alpha = 0;
        this.beta = 0;
        this.theta = 0;
        this.gamma = 0;
        this.delta = 0;
        this.engagement; 
        this.battery = 0;
        this.temperature = 0;
        let ref = this;
        this.bciDevice = new BCIDevice(
            (sample) => {
            // This is here to only read data from AF7
            //console.log(sample.electrode);
                if (sample.electrode !== ScalpElectrodes.AF7) return;
        
            // Add to the buffer
                sample.data.forEach(el => {
                    if (ref.buffer.length > ref.bufferSize) ref.buffer.shift();
                    ref.buffer.push(el);
                });
                if (ref.buffer.length < ref.bufferSize) return;
                let psd = bci.psd(ref.buffer);
                let alpha = bci.psdBandPower(psd, sample.sampleRate, 'alpha');
                let beta = bci.psdBandPower(psd, sample.sampleRate, 'beta');
                let gamma = bci.psdBandPower(psd, sample.sampleRate, 'gamma');
                let delta = bci.psdBandPower(psd, sample.sampleRate, 'delta');
                let theta = bci.psdBandPower(psd, sample.sampleRate, 'theta');
                let sum = alpha + beta + gamma + delta  + theta;

                let wavg = (original, next) => original * ref.weight + (next || 0) * (1 - ref.weight);

                let wa = alpha/sum;
                let wb = beta/sum;
                let wg = gamma/sum;
                let wd = delta/sum;
                let wt = theta/sum;
                let eng = beta/(alpha+theta);

                ref.alpha = wavg(ref.alpha,wa);
                ref.beta = wavg(ref.beta,wb);
                ref.gamma = wavg(ref.gamma,wg);
                ref.delta = wavg(ref.delta,wd);
                ref.theta = wavg(ref.theta,wt);
                ref.engagement = wavg(ref.engagement,eng);
            },

            (status) => {
                ref.battery = status.batteryLevel;
                ref.temperature = status.temperature;
            }   
        );

        
    }

    connect(){
        this.bciDevice.connect();
    }

    setBufferSize(x){
        this.bufferSize = x;
    }
    setWeight(x){
        this.weight = x;
    }

    getAlpha(){
        return this.alpha;
    }
    getBeta(){
        return this.beta;
    }
    getTheta(){
        return this.theta;
    }
    getGamma(){
        return this.theta;
    }
    getDelta(){
        return this.delta
    }
    getEngagement(){
        return this.engagement;
    }
}
function poll(x){
    setInterval(function(){
        document.getElementById('alpha').innerText = x.getAlpha();
        document.getElementById('beta').innerText = x.getBeta();
        document.getElementById('delta').innerText = x.getDelta();
        document.getElementById('theta').innerText = x.getTheta();
        document.getElementById('gamma').innerText = x.getGamma();
        document.getElementById('eng').innerText = x.getEngagement();
    }, 500);
}

eeg = new eegLoad();
poll(eeg);
document.getElementById("connect").onclick = function(){ eeg.connect();};


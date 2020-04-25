import Vue from 'vue';

function HttpClient(baseUrl) {
    return {
        baseURL: baseUrl,

        openLog: function () {
            this.handle.isPrintedLog = true;
        },
        closeLog: function () {
            this.handle.isPrintedLog = false;
        },

        get: function (url, params, caller) {
            let handle = this.handle;
            Vue.axios({
                baseURL: baseUrl,
                method: 'get',
                url: url,
                withCredentials: true,
                params: params,
                headers: {'Authorization': handle.getAuthHeader()}
            }).then(function (response) {
                handle.handleResponse(response, caller);
            }).catch(function (error) {
                handle.handleError(error, caller);
            });
        },

        post: function (url, data, caller) {
            let handle = this.handle;
            Vue.axios({
                baseURL: baseUrl,
                method: 'post',
                url: url,
                withCredentials: true,
                data: data,
                headers: {'Authorization': handle.getAuthHeader()}
            }).then(function (response) {
                handle.handleResponse(response, caller);
            }).catch(function (error) {
                handle.handleError(error, caller);
            });
        },

        postWithParams: function (url, params, caller) {
            let handle = this.handle;
            Vue.axios({
                baseURL: baseUrl,
                method: 'post',
                url: url,
                withCredentials: true,
                params: params,
                headers: {'Authorization': handle.getAuthHeader()}
            }).then(function (response) {
                handle.handleResponse(response, caller);
            }).catch(function (error) {
                handle.handleError(error, caller);
            });
        },

        setAuthorization(token) {
            let authHeader = "Bearer " + token;
            this.handle.setAuthHeader(authHeader);
        },

        removeAuthorization() {
            this.handle.setAuthHeader(null);
        },

        handle: {

            isPrintedLog: false,

            setAuthHeader: function (authHeader) {
                sessionStorage.setItem("authHeader", authHeader);
            },
            getAuthHeader: function () {
                return sessionStorage.getItem("authHeader");
            },
            handleResponse: function (response, caller) {

                if (this.isPrintedLog) {
                    console.info(response);
                }

                if (response.status === 200) {
                    caller(response.data);
                }
                else {
                    caller({
                        isSuccessful: false,
                        responseBody: response.statusText,
                        statusCode: response.status
                    });
                }
            },

            handleError: function (error, caller) {
                console.error(error);
                caller({isSuccessful: false, responseBody: error.message});
            }
        },

    };
}

const randl2HttpClient = new HttpClient("http://localhost:8088/randl2");


export {randl2HttpClient};
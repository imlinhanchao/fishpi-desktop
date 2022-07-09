import FishPi from 'fishpi';

let state = {
    account: null,
    token: null,
    fishpi: new FishPi()
};

const mutations = {
    setToken(state, token) {
        state.token = token;
        state.fishpi.setToken(token);
    },
    setAccount(state, account) {
        state.account = account;
    }
};

const actions = {
    async login({ state, commit, dispatch }, account) {
        let rsp = await state.fishpi.login(account);
        if (!rsp) return;
        if (rsp.code != 0) {
            throw(rsp.msg);
        }
        commit('setToken', rsp.Key);
        localStorage.setItem('token', rsp.Key);
        await dispatch('getInfo');
        return rsp.Key;
    },

    async getInfo({ state, commit }) {
        let rsp = await state.fishpi.account.info();
        if (rsp.code != 0) {
            throw(rsp.msg);
        }
        commit('setAccount', rsp.data);
        return rsp.data;
    },

    async logout({ state, commit }) {
        commit('setToken', null);
        commit('setAccount', null);
        localStorage.removeItem('token');
    }
};

const getters = {
    isLogin (state) {
        return !!state.token;
    },
    account (state) {
        return state.account;
    },
    fishpi (state) {
        return state.fishpi;
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
}
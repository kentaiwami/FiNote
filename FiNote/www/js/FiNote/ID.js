/************************************************************
                            ID
 ************************************************************/

/**
 * js内で参照するIDをまとめたオブジェクト
 * @type {Object}
 */
var ID = {
  get_index_ID: function() {
    return {tmp_id: 'index.html', page_id: 'index'};
  },


  get_top_ID: function() {
    return {
      tmp_id: 'top.html', page_id: 'top',
      toolbar_center: 'carousel_toolbar_center', carousel: 'top_carousel'
    };
  },


  get_tab_ID: function() {
      return {tmp_id: 'tab.html', page_id: 'tab'};
  },


  get_signin_ID: function() {
    return {
      username: 'signin_username', password: 'signin_password',
      signin_button: 'signin_button', signin_carousel: 'signin_carousel'
    };
  },


  get_signup_ID: function() {
    return {
      tmp_id: 'signup.html',
      page_id: 'signup',
      signup_button: 'signup_button',
      list_id: 'signup_list',
      username: 'username',
      password: 'password',
      email: 'email',
      birthday: 'birthday',
      success_alert: 'signup-alert-success',
      error_message: 'error-message',
      radio: 'radio_m'
    };
  },


  get_movies_ID: function() {
    return {
      tmp_id: 'movies.html',
      page_id: 'movies',
      nodata_message: 'nodata_message',
      nodata_message_p: 'nodata_message_p',
      list: 'movie_collection_list',
      reset_button: 'movies_reset_button',
      search_input: 'search_local_movies_input',
      list_header: 'movies_list_header',
      search_area: 'movies_search_area'
    };
  },


  get_movies_detail_ID: function() {
    return {
      tmp_id: 'movies_detail.html', page_id: 'movies_detail',
      poster: 'detail_poster_area', detail: 'movie_detail_area',
      alert: 'success_sns_alert_detail', modal: 'modal_detail',
      modal_poster: 'modal_poster'
    };
  },


  get_feeling_ID: function() {
    return {
      tmp_id: 'feeling.html', page_id: 'feeling',
      toolbar: 'feeling_toolbar_left', nodata_message: 'feeling_nodata_message',
      caution_message: 'feeling_caution_message', list: 'feeling_list',
      add_dialog: 'feeling_add_dialog', edit_dialog: 'feeling_edit_dialog',
      add_button: 'feeling_add_button', edit_button: 'feeling_edit_button',
      input: 'feeling_input_name', edit_input: 'feeling_edit_input_name'
    };
  },


  get_movieadd_search_ID: function() {
    return {
      tmp_id: 'movieadd_search', page_id: 'movieadd_search',
      form: 'search_movie_title', nodata_message: 'movieadd_no_match_message',
      reset: 'movieadd_reset_button', list: 'movieadd_search_list',
      exist_alert: 'tap_exist_movie_list', first_search_link: 'first_search_link',
      more_search_link: 'more_search_link', search_result_list_header: 'search_result_list_header'
    };
  },


  get_moveadd_ID: function() {
    return {
      tmp_id: 'movieadd.html', page_id: 'movieadd', poster: 'movieadd_card',
      detail_info: 'movie_detail_info', add_button: 'movieadd_add_button',
      feeling_button: 'movieadd_pushfeeling_button',
      dvd_button: 'movieadd_pushdvd_button',
      share_button: 'movieadd_share_button',
      show_info_button: 'movieadd_show_info_button',
      back_button: 'movieadd_back_button', feeling_number: 'list_number',
      success_alert: 'success_movieadd_alert',
      success_sns_alert: 'success_sns_alert'
    };
  },


  get_movieadd_status_ID: function() {
    return {
      tmp_id: 'movieadd_status.html', page_id: 'movieadd_status',
      dvd: 'dvd_switch', fav: 'fav_switch',
      toolbar: 'status_toolbar_left', small_message: 'small_message'
    };
  },

  get_social_ID: function () {
    return {
      tmp_id: 'social.html', page_id: 'social', movie_list: 'social_movie_list', modal: 'social_movie_list_modal',
      modal_rank: 'social_movie_list_rank', modal_title: 'social_movie_list_title', modal_overview: 'social_movie_list_overview',
      search_area: 'social_movies_search_area', social_movies_input: 'search_social_movies_input',
      social_movies_reset_button: 'social_movies_reset_button'
    };
  },


  get_user_ID: function() {
    return {
      tmp_id: 'user.html', page_id: 'user', movies_number: 'movies_count_number',
      dvds_number: 'dvds_count_number',
      favorites_number: 'favorites_count_number',
      onomatopoeia_top3: 'onomatopoeia_top3', genre_top3: 'genre_top3',
      chart1: 'chart1', chart2: 'chart2', graph_area: 'user_graph_area'
    };
  },


  get_setting_ID: function() {
    return {
      tmp_id: 'setting.html',
      page_id: 'setting',
      username: 'user_username',
      email: 'user_email',
      adult_check: 'adult_check',
      profile_img: 'profile_img'
    };
  },


  get_change_password_ID: function() {
    return {
      tmp_id: 'change_password.html',
      page_id: 'change_password',
      now_password: 'now_password',
      new_password: 'new_password',
      re_new_password: 're_new_password',
      submit_password: 'submit_change_password',
      success_alert: 'change_password_success_alert'
    };
  },


  get_change_email_ID: function() {
    return {
      tmp_id: 'change_email.html', page_id: 'change_email',
      input_new_email: 'new_email', submit_email: 'submit_change_email',
      success_alert: 'change_email_success_alert'
    };
  },


  get_change_sex_ID: function() {
    return {
      tmp_id: 'change_sex.html', page_id: 'change_sex',
      radio_m: 'change_m', radio_f: 'change_f',
      success_alert: 'change_sex_success_alert'
    };
  },


  get_utility_ID: function() {
    return {navigator: 'myNavigator'};
  },

  get_localStorage_ID: function() {
    return {
      username: 'username',
      password: 'password',
      email: 'email',
      birthday: 'birthday',
      sex: 'sex',
      adult: 'adult',
      token: 'token',
      profile_img: 'profile_img',
      signup_flag: 'signup_flag'
    };
  }
};
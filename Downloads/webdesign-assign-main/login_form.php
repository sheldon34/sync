			<form id="login_form1" class="form-signin" method="post" novalidate>
						<h3 class="form-signin-heading"><i class="icon-lock"></i> Sign in</h3>
						<div id="login_feedback" class="alert" style="display:none; margin-bottom: 12px;"></div>
						<label for="username" class="sr-only" style="position:absolute; left:-9999px;">Username</label>
						<input type="text" class="input-block-level" id="username" name="username" placeholder="Username" autocomplete="username" autocapitalize="none" spellcheck="false" autofocus required>
						<label for="password" class="sr-only" style="position:absolute; left:-9999px;">Password</label>
						<input type="password" class="input-block-level" id="password" name="password" placeholder="Password" autocomplete="current-password" required>
						<label class="checkbox" style="margin-top: 6px;">
							<input type="checkbox" id="toggle_password"> Show password
						</label>
						<button data-placement="right" title="Click Here to Sign In" id="signin" name="login" class="btn btn-info" type="submit">
							<i id="signin_icon" class="icon-signin icon-large"></i>
							<span id="signin_text">Sign in</span>
						</button>
														<script type="text/javascript">
														$(document).ready(function(){
															$('#signin').tooltip('show');
															$('#signin').tooltip('hide');
														});
														</script>		
			</form>
						<script>
						jQuery(document).ready(function(){
							function setFeedback(kind, message){
								var $box = jQuery('#login_feedback');
								$box.removeClass('alert-info alert-success alert-error');
								if (kind === 'success') $box.addClass('alert-success');
								else if (kind === 'info') $box.addClass('alert-info');
								else if (kind === 'warning') $box.addClass('alert-info');
								else $box.addClass('alert-error');
								$box.text(message).show();
							}

							jQuery('#toggle_password').on('change', function(){
								jQuery('#password').attr('type', this.checked ? 'text' : 'password');
							});

							function setLoading(isLoading){
								jQuery('#signin').prop('disabled', isLoading);
								jQuery('#username, #password, #toggle_password').prop('disabled', isLoading);
								jQuery('#signin_text').text(isLoading ? 'Signing in…' : 'Sign in');
								jQuery('#signin_icon').attr('class', isLoading ? 'icon-refresh icon-spin icon-large' : 'icon-signin icon-large');
							}

						jQuery("#login_form1").submit(function(e){
								e.preventDefault();
								var username = jQuery.trim(jQuery('#username').val() || '');
								var password = jQuery('#password').val() || '';
								if (!username || !password){
									setFeedback('warning', 'Please enter both username and password.');
									return false;
								}

								setFeedback('info', 'Signing you in…');
								setLoading(true);
								var formData = jQuery(this).serialize();
								$.ajax({
									type: "POST",
									url: "login.php",
									data: formData,
									timeout: 15000,
									success: function(html){
									var response = jQuery.trim(html || '');
									if(response=='true')
									{
									setFeedback('success', 'Welcome back! Redirecting…');
									$.jGrowl("Welcome to Opps Academy Learning Management System", { header: 'Access Granted' });
									var delay = 1000;
										setTimeout(function(){ window.location = 'dasboard_teacher.php'  }, delay);  
									}else if (response == 'true_student'){
										setFeedback('success', 'Welcome back! Redirecting…');
										$.jGrowl("Welcome to Opps Academy Learning Management System", { header: 'Access Granted' });
									var delay = 1000;
										setTimeout(function(){ window.location = 'student_notification.php'  }, delay);  
									}else if (response == 'missing'){
										setFeedback('warning', 'Please enter both username and password.');
									}else
									{
									setFeedback('error', 'Incorrect username or password.');
									$.jGrowl("Please Check your username and Password", { header: 'Login Failed' });
									}
									setLoading(false);
									}
									,
									error: function(){
										setLoading(false);
										setFeedback('error', 'Could not reach the server. Please check your connection and try again.');
									}
								});
								return false;
							});
						});
						</script>
			<div id="button_form" class="form-signin" >
			New to Opps Academy OLMS?
			<hr>
				<h3 class="form-signin-heading"><i class="icon-edit"></i> Sign up</h3>
				<button data-placement="top" title="Sign In as Student" id="signin_student" onclick="window.location='signup_student.php'" name="login" class="btn btn-info" type="button">I`m a Student</button>
				<div class="pull-right">
					<button data-placement="top" title="Sign In as Teacher" id="signin_teacher" onclick="window.location='signup_teacher.php'" name="login" class="btn btn-info" type="button">I`m a Lecturer</button>
				</div>
			</div>
														<script type="text/javascript">
														$(document).ready(function(){
															$('#signin_student').tooltip('show'); $('#signin_student').tooltip('hide');
														});
														</script>	
														<script type="text/javascript">
														$(document).ready(function(){
															$('#signin_teacher').tooltip('show'); $('#signin_teacher').tooltip('hide');
														});
														</script>	
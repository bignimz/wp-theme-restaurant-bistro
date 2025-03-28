<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package BAT_Bistro
 */

?>

	<footer id="colophon" class="site-footer">
		<div class="site-info container">
			<span class="copyright-text">
				&copy; <?php echo date('Y'); ?> 
				<?php 
					// Translators: This is the copyright text including the company name.
					echo esc_html__( 'BigJim Pizza Bistro. all rights reserved', 'bat_bistro' ); 
				?>
			</span>

			<span class="copyright-text"> |
				<?php 
					// Translators: This is the theme credit text, do not translate the developer's name.
					printf( 
						esc_html__( 'Theme by: %s', 'bat_bistro' ), 
						'<a href="http://nimrod.emerginghost.co.ke" target="_blank" title="' . esc_attr__( 'Nimrod Musungu: Professional WordPress Theme Developer', 'your-textdomain' ) . '">Nimrod Musungu</a>' 
					); 
				?>
			</span>

		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>

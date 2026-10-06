package com.tasty.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;

/** Single-row restaurant profile (id is always 1). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "restaurant_settings")
@EntityListeners(AuditingEntityListener.class)
public class RestaurantSettings {

    public static final short SINGLETON_ID = 1;

    @Id
    private Short id = SINGLETON_ID;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 200)
    private String tagline;

    @Column(name = "tagline_fr", length = 200)
    private String taglineFr;

    @Column(length = 1000)
    private String description;

    @Column(name = "description_fr", length = 1000)
    private String descriptionFr;

    @Column(name = "address_line", length = 200)
    private String addressLine;

    @Column(length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    @Column(length = 40)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "map_url", length = 1000)
    private String mapUrl;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "instagram_url", length = 500)
    private String instagramUrl;

    @Column(name = "facebook_url", length = 500)
    private String facebookUrl;

    @Column(name = "tiktok_url", length = 500)
    private String tiktokUrl;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "USD";

    @Column(length = 200)
    private String announcement;

    @Column(name = "announcement_fr", length = 200)
    private String announcementFr;

    @Column(name = "promo_enabled", nullable = false)
    private boolean promoEnabled;

    @Column(name = "promo_title", length = 120)
    private String promoTitle;

    @Column(name = "promo_title_fr", length = 120)
    private String promoTitleFr;

    @Column(name = "promo_text", length = 500)
    private String promoText;

    @Column(name = "promo_text_fr", length = 500)
    private String promoTextFr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_menu_item_id")
    private MenuItem promoMenuItem;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}
